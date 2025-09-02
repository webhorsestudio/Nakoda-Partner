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

    // Get partner's service type
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('service_type')
      .eq('id', partnerId)
      .single();

    if (partnerError) {
      console.error('Error fetching partner service type:', partnerError);
      return NextResponse.json({ error: 'Failed to fetch partner data' }, { status: 500 });
    }

    // Get all orders for this partner
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        service_type,
        status,
        amount,
        created_at
      `)
      .eq('partner_id', partnerId);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders data' }, { status: 500 });
    }

    // Group orders by service type
    const servicePerformanceMap = new Map<string, {
      totalTasks: number;
      completedTasks: number;
      totalEarnings: number;
    }>();

    orders?.forEach(order => {
      const serviceType = order.service_type || 'Other';
      const existing = servicePerformanceMap.get(serviceType) || {
        totalTasks: 0,
        completedTasks: 0,
        totalEarnings: 0
      };

      existing.totalTasks += 1;
      
      if (order.status === 'completed') {
        existing.completedTasks += 1;
        existing.totalEarnings += order.amount || 0;
      }

      servicePerformanceMap.set(serviceType, existing);
    });

    // Convert to array format
    const taskPerformance = Array.from(servicePerformanceMap.entries()).map(([serviceType, data]) => {
      return {
        serviceType,
        totalTasks: data.totalTasks,
        completedTasks: data.completedTasks,
        completionRate: data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0,
        totalEarnings: Math.round(data.totalEarnings)
      };
    });

    // Sort by total earnings (descending)
    taskPerformance.sort((a, b) => b.totalEarnings - a.totalEarnings);

    return NextResponse.json({
      success: true,
      data: taskPerformance
    });

  } catch (error) {
    console.error('Error in partner performance API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
