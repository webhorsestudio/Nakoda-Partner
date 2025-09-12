import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPartnerToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify partner authentication
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = authResult.userId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get partner information
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, name, service_type')
      .eq('id', partnerId)
      .single();

    if (partnerError) {
      console.error('Error fetching partner data:', partnerError);
      return NextResponse.json({ error: 'Failed to fetch partner data' }, { status: 500 });
    }

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Build query for orders
    let query = supabase
      .from('orders')
      .select(`
        id,
        bitrix24_id,
        title,
        specification,
        amount,
        currency,
        status,
        service_type,
        created_at,
        updated_at,
        customer_name,
        mobile_number,
        address,
        city,
        pin_code,
        advance_amount,
        commission_percentage,
        service_date,
        time_slot,
        date_created,
        order_number
      `)
      .eq('partner_id', partnerId);

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply limit and ordering
    query = query
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Transform orders to match the expected format
    const transformedOrders = orders?.map(order => ({
      id: order.id,
      isExclusive: false, // Default value
      countdown: calculateCountdown(order.created_at),
      scheduledTime: order.created_at,
      location: `${order.city || 'Unknown City'}${order.pin_code ? ` - ${order.pin_code}` : ''}`,
      credits: Math.floor((order.amount || 0) / 100), // 1 credit = ₹100
      likes: 0, // Default value
      status: order.status as 'pending' | 'accepted' | 'completed' | 'cancelled',
      priority: 'medium', // Default priority
      category: order.service_type || 'General',
      customerName: order.customer_name || 'Customer',
      estimatedDuration: order.time_slot || '2-4 hours', // Use time_slot or default duration
      orderNumber: `ORD-${order.id}`,
      advanceAmount: order.amount ? `₹${order.amount}` : '₹0',
      taxesAndFees: '₹0', // Default value
      commissionPercentage: '25%' // Default value
    })) || [];

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('partner_id', partnerId);

    return NextResponse.json({
      success: true,
      data: transformedOrders,
      total: totalCount || 0,
      partner: {
        id: partner.id,
        name: partner.name,
        serviceType: partner.service_type || 'General'
      }
    });

  } catch (error) {
    console.error('Error in partners orders API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to calculate countdown
function calculateCountdown(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m ago`;
  } else {
    return `${diffMinutes}m ago`;
  }
}