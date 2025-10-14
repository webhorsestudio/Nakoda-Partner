import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPartnerToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify partner authentication
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const partnerId = authResult.userId;

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query for partner's accepted orders
    let query = supabase
      .from('orders')
      .select(`
        id,
        bitrix24_id,
        title,
        service_type,
        specification,
        status,
        amount,
        currency,
        customer_name,
        address,
        city,
        pin_code,
        advance_amount,
        commission_percentage,
        service_date,
        time_slot,
        date_created,
        created_at,
        order_number,
        mobile_number,
        partner_id,
        mode,
        package,
        partner_completion_status
      `)
      .eq('partner_id', partnerId) // Only orders assigned to this partner
      .neq('status', 'completed') // Exclude completed orders from ongoing tasks
      .neq('partner_completion_status', 'completed') // Also exclude partner-completed orders
      .order('created_at', { ascending: false }) // Latest first
      .limit(limit)
      .range((page - 1) * limit, page * limit - 1);

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Filter by search term
    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,title.ilike.%${search}%,service_type.ilike.%${search}%`);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error('Error fetching partner accepted orders:', ordersError);
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: ordersError.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('partner_id', partnerId)
      .neq('status', 'completed') // Exclude completed orders from ongoing tasks
      .neq('partner_completion_status', 'completed'); // Also exclude partner-completed orders

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    if (search) {
      countQuery = countQuery.or(`customer_name.ilike.%${search}%,title.ilike.%${search}%,service_type.ilike.%${search}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error fetching count:', countError);
    }

    // Transform orders to match OngoingTask interface
    const transformedOrders = orders?.map(order => {
      const amount = parseFloat(order.amount?.toString() || '0');
      const advanceAmount = parseFloat(order.advance_amount?.toString() || '0');
      const commissionPercentage = parseFloat(order.commission_percentage?.toString() || '0');
      const commissionAmount = (amount * commissionPercentage) / 100;
      const balanceAmount = amount - advanceAmount;

      return {
        id: order.id,
        title: order.title || 'Service Request',
        description: order.specification || 'Service description not available',
        package: order.package || null,
        customerName: order.customer_name || 'Customer',
        location: `${order.city || 'Unknown City'}${order.pin_code ? ` - ${order.pin_code}` : ''}`,
        amount: amount,
        duration: order.time_slot || '2-4 hours',
        serviceType: order.service_type || 'General Service',
        orderNumber: order.order_number || order.bitrix24_id || order.id,
        orderDate: new Date(order.date_created || order.created_at).toISOString().split('T')[0],
        serviceDate: order.service_date || new Date().toISOString().split('T')[0],
        serviceTime: order.time_slot || 'Not specified',
        status: order.status as 'in-progress' | 'completed' | 'cancelled' | 'assigned',
        startTime: order.status === 'in-progress' ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : undefined,
        estimatedEndTime: order.time_slot ?
          new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : undefined,
        actualStartTime: order.status === 'in-progress' ?
          new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : undefined,
        currentPhase: order.status === 'completed' ? 'Completed' :
                     order.status === 'in-progress' ? 'In Progress' :
                     order.status === 'assigned' ? 'Assigned' : 'Unknown',
        notes: order.specification || '',
        photos: [],
        customerPhone: order.mobile_number || '',
        customerAddress: order.address || '',
        advanceAmount: advanceAmount,
        balanceAmount: balanceAmount,
        commissionAmount: commissionAmount,
        mode: order.mode || null
      };
    }) || [];

    console.log(`Returning ${transformedOrders.length} accepted orders to partner ${partnerId}`);
    
    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('Error in partner accepted orders API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
