import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/auth';

interface PartnerJoin {
  name: string;
  city: string;
  mobile: string;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query for accepted orders with partner join
    let query = supabase
      .from('orders')
      .select(`
        id,
        bitrix24_id,
        title,
        service_type,
        specification,
        status,
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
        amount,
        partner_id,
        partner,
        mode,
        package,
        partners!partner_id(name, city, mobile)
      `)
      .not('partner_id', 'is', null) // Only orders assigned to partners
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
      console.error('Error fetching accepted orders:', ordersError);
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: ordersError.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .not('partner_id', 'is', null)

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

    // Transform orders to match UI format
    const transformedOrders = orders?.map(order => ({
      id: order.id,
      title: order.title || 'Service Request',
      description: order.specification || order.title || 'Service request',
      orderNumber: order.order_number || 'N/A',
      customerName: order.customer_name || 'Customer',
      customerPhone: order.mobile_number || '',
      location: `${order.city || 'Unknown City'}${order.pin_code ? ` - ${order.pin_code}` : ''}`,
      amount: parseFloat(order.amount?.toString() || '0'),
      advanceAmount: parseFloat(order.advance_amount?.toString() || '0'),
      serviceType: order.package || order.service_type || 'General Service',
      priority: 'medium', // Default priority
      estimatedDuration: order.time_slot || '2-4 hours',
      createdAt: order.date_created || order.created_at,
      status: order.status || 'assigned',
      serviceDate: order.service_date,
      timeSlot: order.time_slot,
      partnerName: (order.partners as PartnerJoin[])?.[0]?.name || undefined, // Use actual partner name from join
      partnerId: order.partner_id
    })) || [];

    
    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('Error in admin accepted orders API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
