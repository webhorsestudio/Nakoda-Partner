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

    // Get orders for the specified time range
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        amount,
        status,
        service_type
      `)
      .eq('partner_id', partnerId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString())
      .order('created_at', { ascending: true });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders data' }, { status: 500 });
    }

    // Group orders by date and calculate daily earnings
    const earningsMap = new Map<string, { earnings: number; tasks: number; commission: number }>();

    orders?.forEach(order => {
      if (order.status === 'completed') {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const existing = earningsMap.get(date) || { earnings: 0, tasks: 0, commission: 0 };
        
        existing.earnings += order.amount || 0;
        existing.tasks += 1;
        existing.commission += (order.amount || 0) * 0.25; // Assuming 25% commission
        
        earningsMap.set(date, existing);
      }
    });

    // Convert to array format
    const earningsData = Array.from(earningsMap.entries()).map(([date, data]) => ({
      date,
      earnings: Math.round(data.earnings),
      tasks: data.tasks,
      commission: Math.round(data.commission)
    }));

    // Sort by date
    earningsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Fill in missing dates with zero values
    const filledEarningsData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingData = earningsData.find(item => item.date === dateStr);
      
      filledEarningsData.push({
        date: dateStr,
        earnings: existingData?.earnings || 0,
        tasks: existingData?.tasks || 0,
        commission: existingData?.commission || 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      success: true,
      data: filledEarningsData
    });

  } catch (error) {
    console.error('Error in partner earnings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
