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
    const timeRange = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get recent orders for this partner within the time range
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        title,
        amount,
        status,
        partner_completion_status,
        service_type,
        created_at
      `)
      .eq('partner_id', partnerId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders data' }, { status: 500 });
    }

    // Transform orders to transaction format
    const transactions = orders?.map(order => {
      // Map partner_completion_status to transaction status
      let transactionStatus: 'completed' | 'pending' | 'cancelled';
      if (order.partner_completion_status === 'completed') {
        transactionStatus = 'completed';
      } else if (order.partner_completion_status === 'cancelled') {
        transactionStatus = 'cancelled';
      } else {
        transactionStatus = 'pending';
      }

      return {
        id: order.id,
        service: order.title || order.service_type || 'Service',
        amount: order.amount || 0,
        status: transactionStatus,
        date: order.created_at,
        commission: Math.round((order.amount || 0) * 0.25) // Assuming 25% commission
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('Error in partner revenue transactions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
