import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { supabaseAdmin, executeAdminQuery } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Admin-only authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    console.log(`🔍 Admin requesting real-time orders`);

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 records
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build optimized query with proper indexing strategy
    let query = supabaseAdmin
      .from('orders')
      .select(`
        id,
        bitrix24_id,
        title,
        status,
        amount,
        currency,
        customer_name,
        city,
        pin_code,
        advance_amount,
        service_date,
        time_slot,
        date_created,
        created_at,
        order_number,
        mobile_number,
        partner_id,
        service_type
      `, { count: 'exact' }) // Get total count for pagination
      .order('created_at', { ascending: false }) // Use indexed column
      .range(offset, offset + limit - 1); // Efficient pagination

    // Apply status filter if specified
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply search filter if specified
    if (search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`customer_name.ilike.${searchTerm},order_number.ilike.${searchTerm},service_type.ilike.${searchTerm}`);
    }

    // Execute query with timeout handling and circuit breaker
    const startTime = Date.now();
    const { data: orders, error: ordersError, count } = await executeAdminQuery(async () => {
      return await query;
    });
    const queryTime = Date.now() - startTime;

    if (ordersError) {
      console.error('Error fetching admin orders:', ordersError);
      
      // Handle specific timeout errors
      if (ordersError.code === '57014') {
        return NextResponse.json(
          { 
            error: 'Query timeout', 
            message: 'Database query took too long. Please try with more specific filters.',
            suggestion: 'Try reducing the date range or using search filters'
          },
          { status: 408 } // Request Timeout
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: ordersError.message },
        { status: 500 }
      );
    }

    // Log performance metrics
    console.log(`📊 Query performance: ${queryTime}ms, ${orders?.length || 0} records`);

    // Transform orders for admin interface - optimized mapping
    const transformedOrders = orders?.map(order => ({
      id: order.id,
      title: order.title || 'Service Request',
      description: order.title || 'Service request', // Simplified description
      customerName: order.customer_name || 'Customer',
      customerPhone: order.mobile_number || '',
      location: `${order.city || 'Unknown City'}${order.pin_code ? ` - ${order.pin_code}` : ''}`,
      amount: parseFloat(order.amount?.toString() || '0'),
      advanceAmount: parseFloat(order.advance_amount?.toString() || '0'),
      serviceType: order.service_type || 'General Service',
      priority: 'medium', // Default priority
      estimatedDuration: order.time_slot || '2-4 hours',
      createdAt: order.date_created || order.created_at,
      status: order.status || 'pending',
      serviceDate: order.service_date,
      timeSlot: order.time_slot,
      mode: null, // Simplified - remove complex mode logic
      partnerId: order.partner_id,
      orderNumber: order.order_number,
      package: order.service_type // Use service_type as package
    })) || [];

    // Calculate stats efficiently - only for current page data
    const stats = {
      total: count || 0,
      pending: transformedOrders.filter(o => o.status === 'pending').length,
      assigned: transformedOrders.filter(o => o.status === 'assigned').length,
      completed: transformedOrders.filter(o => o.status === 'completed').length,
      unassigned: transformedOrders.filter(o => !o.partnerId).length,
      assignedToPartner: transformedOrders.filter(o => o.partnerId).length,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
      queryTime: queryTime
    };

    console.log(`✅ Admin real-time orders fetched: ${transformedOrders.length} orders (page ${page}/${stats.totalPages})`);

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      stats: stats,
      total: count || 0,
      userType: 'admin',
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit,
        totalPages: stats.totalPages,
        hasNextPage: page < stats.totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Admin real-time orders error:', error);
    
    // Handle timeout errors gracefully
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { 
          error: 'Request timeout', 
          message: 'The request took too long to process. Please try again with more specific filters.',
          suggestion: 'Try using search filters or reducing the date range'
        },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
