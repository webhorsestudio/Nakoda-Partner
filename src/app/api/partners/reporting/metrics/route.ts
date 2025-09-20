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

    // Get partner's performance metrics
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select(`
        id,
        name,
        rating,
        total_orders,
        total_revenue,
        commission_percentage,
        service_type,
        status,
        verification_status,
        joined_date,
        last_active
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

    // Get recent orders for additional metrics
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, created_at, amount')
      .eq('partner_id', partnerId)
      .gte('created_at', startDate.toISOString()) // Use calculated start date
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching recent orders:', ordersError);
    }

    // Calculate additional metrics
    const completedOrders = recentOrders?.filter(order => order.status === 'completed') || [];
    const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const activeHours = Math.floor((Date.now() - new Date(partner.joined_date).getTime()) / (1000 * 60 * 60 * 24)) * 8; // Rough estimate
    const customerSatisfaction = Math.round((partner.rating || 0) * 20); // Convert 5-star to percentage
    const totalRecentOrders = recentOrders?.length || 0;
    const onTimeCompletion = totalRecentOrders > 0 ? Math.round((completedOrders.length / totalRecentOrders) * 100) : 0;

    // Format the response
    const performanceMetrics = {
      totalEarnings: Math.round(totalEarnings),
      totalTasks: partner.total_orders || 0,
      completedTasks: completedOrders.length,
      averageRating: partner.rating || 0,
      totalReviews: Math.floor((partner.total_orders || 0) * 0.7), // Estimate based on orders
      activeHours: Math.max(activeHours, 0),
      customerSatisfaction: Math.min(customerSatisfaction, 100),
      onTimeCompletion: Math.min(onTimeCompletion, 100)
    };

    return NextResponse.json({
      success: true,
      data: performanceMetrics
    });

  } catch (error) {
    console.error('Error in partner metrics API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
