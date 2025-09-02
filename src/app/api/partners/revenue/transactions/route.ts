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
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent orders for this partner
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        title,
        amount,
        status,
        service_type,
        created_at
      `)
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders data' }, { status: 500 });
    }

    // Transform orders to transaction format
    const transactions = orders?.map(order => ({
      id: order.id,
      service: order.title || order.service_type || 'Service',
      amount: order.amount || 0,
      status: order.status as 'completed' | 'pending' | 'cancelled',
      date: order.created_at,
      commission: Math.round((order.amount || 0) * 0.25) // Assuming 25% commission
    })) || [];

    return NextResponse.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('Error in partner revenue transactions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
