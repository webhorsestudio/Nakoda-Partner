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

    // Get partner's revenue stats
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select(`
        id,
        name,
        total_orders,
        total_revenue,
        commission_percentage,
        service_type,
        status
      `)
      .eq('id', partnerId)
      .single();

    if (partnerError) {
      console.error('Error fetching partner data:', partnerError);
      return NextResponse.json({ error: 'Failed to fetch partner data' }, { status: 500 });
    }

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Get all orders for this partner
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        amount,
        status,
        service_type,
        created_at
      `)
      .eq('partner_id', partnerId);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders data' }, { status: 500 });
    }

    // Calculate revenue stats
    const completedOrders = orders?.filter(order => order.status === 'completed') || [];
    const pendingOrders = orders?.filter(order => order.status === 'pending') || [];
    
    const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const pendingAmount = pendingOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const commissionEarned = totalEarnings * (partner.commission_percentage || 0.25);
    const averageEarnings = completedOrders.length > 0 ? totalEarnings / completedOrders.length : 0;

    // Calculate growth (simplified - comparing last 30 days vs previous 30 days)
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const last30DaysOrders = completedOrders.filter(order => 
      new Date(order.created_at) >= last30Days
    );
    const previous30DaysOrders = completedOrders.filter(order => 
      new Date(order.created_at) >= previous30Days && new Date(order.created_at) < last30Days
    );

    const last30DaysRevenue = last30DaysOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const previous30DaysRevenue = previous30DaysOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    const monthlyGrowth = previous30DaysRevenue > 0 
      ? ((last30DaysRevenue - previous30DaysRevenue) / previous30DaysRevenue) * 100 
      : 0;

    // Calculate service breakdown
    const serviceBreakdownMap = new Map<string, { earnings: number; tasks: number }>();
    
    completedOrders.forEach(order => {
      const serviceType = order.service_type || 'Other';
      const existing = serviceBreakdownMap.get(serviceType) || { earnings: 0, tasks: 0 };
      existing.earnings += order.amount || 0;
      existing.tasks += 1;
      serviceBreakdownMap.set(serviceType, existing);
    });

    const serviceBreakdown = Array.from(serviceBreakdownMap.entries()).map(([serviceType, data], index) => {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
      return {
        serviceType,
        earnings: data.earnings,
        tasks: data.tasks,
        percentage: totalEarnings > 0 ? (data.earnings / totalEarnings) * 100 : 0,
        color: colors[index % colors.length]
      };
    });

    const revenueStats = {
      totalEarnings: Math.round(totalEarnings),
      totalTasks: orders?.length || 0,
      averageEarnings: Math.round(averageEarnings),
      commissionEarned: Math.round(commissionEarned),
      pendingAmount: Math.round(pendingAmount),
      completedTasks: completedOrders.length,
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
      weeklyGrowth: Math.round(monthlyGrowth * 0.25 * 10) / 10 // Simplified weekly growth
    };

    return NextResponse.json({
      success: true,
      data: {
        stats: revenueStats,
        serviceBreakdown
      }
    });

  } catch (error) {
    console.error('Error in partner revenue stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
