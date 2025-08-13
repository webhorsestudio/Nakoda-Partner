import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ReportFilters } from '@/types/reports';

export async function POST(request: NextRequest) {
  try {
    const filters: ReportFilters = await request.json();
    
    // Build the base query
    let query = supabase
      .from('orders')
      .select('*');

    // Apply date filters
    if (filters.dateRange !== 'custom' || (filters.startDate && filters.endDate)) {
      let startDate: string;
      let endDate: string;
      
      if (filters.dateRange === 'custom') {
        startDate = filters.startDate;
        endDate = filters.endDate;
      } else {
        const now = new Date();
        switch (filters.dateRange) {
          case 'last7days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'last30days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'last90days':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'lastYear':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString();
            break;
          default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        }
        endDate = now.toISOString();
      }
      
      query = query.gte('date_created', startDate).lte('date_created', endDate);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Apply city filter
    if (filters.city !== 'all') {
      query = query.eq('city', filters.city);
    }

    // Apply partner filter
    if (filters.partner !== 'all') {
      query = query.eq('partner', filters.partner);
    }

    // Apply amount filters
    if (filters.minAmount) {
      query = query.gte('amount', parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      query = query.lte('amount', parseFloat(filters.maxAmount));
    }

    // Execute the query
    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders for reports:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders data' },
        { status: 500 }
      );
    }

    if (!orders) {
      return NextResponse.json({
        reportData: { items: [], totalCount: 0, totalRevenue: 0, averageOrderValue: 0 },
        summaryStats: {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          ordersThisMonth: 0,
          revenueThisMonth: 0,
          completionRate: 0,
          newOrdersToday: 0,
          pendingOrders: 0
        },
        chartData: {
          ordersByStatus: [],
          ordersByMonth: [],
          ordersByCity: [],
          ordersByPartner: [],
          revenueTrend: []
        }
      });
    }

    // Calculate summary statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get current month data
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const ordersThisMonth = orders.filter(order => {
      const orderDate = new Date(order.date_created);
      return orderDate >= currentMonthStart && orderDate <= currentMonthEnd;
    }).length;
    
    const revenueThisMonth = orders.filter(order => {
      const orderDate = new Date(order.date_created);
      return orderDate >= currentMonthStart && orderDate <= currentMonthEnd;
    }).reduce((sum, order) => sum + (order.amount || 0), 0);

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const newOrdersToday = orders.filter(order => {
      const orderDate = new Date(order.date_created);
      return orderDate >= today && orderDate < tomorrow;
    }).length;

    // Calculate completion rate
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Count pending orders
    const pendingOrders = orders.filter(order => 
      order.status === 'new' || order.status === 'in_progress'
    ).length;

    // Generate chart data
    const ordersByStatus = [
      { status: 'New', count: orders.filter(o => o.status === 'new').length, percentage: 0 },
      { status: 'In Progress', count: orders.filter(o => o.status === 'in_progress').length, percentage: 0 },
      { status: 'Completed', count: orders.filter(o => o.status === 'completed').length, percentage: 0 },
      { status: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, percentage: 0 }
    ];

    // Calculate percentages
    ordersByStatus.forEach(item => {
      item.percentage = totalOrders > 0 ? Math.round((item.count / totalOrders) * 100) : 0;
    });

    // Generate monthly data for the last 6 months
    const ordersByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.date_created);
        return orderDate >= monthDate && orderDate <= monthEnd;
      });
      
      ordersByMonth.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum, order) => sum + (order.amount || 0), 0)
      });
    }

    // Generate city data
    const cityMap = new Map();
    orders.forEach(order => {
      const city = order.city || 'Unknown';
      if (!cityMap.has(city)) {
        cityMap.set(city, { city, orders: 0, revenue: 0 });
      }
      cityMap.get(city).orders++;
      cityMap.get(city).revenue += order.amount || 0;
    });
    const ordersByCity = Array.from(cityMap.values());

    // Generate partner data
    const partnerMap = new Map();
    orders.forEach(order => {
      const partner = order.partner || 'Unknown';
      if (!partnerMap.has(partner)) {
        partnerMap.set(partner, { partner, orders: 0, revenue: 0 });
      }
      partnerMap.get(partner).orders++;
      partnerMap.get(partner).revenue += order.amount || 0;
    });
    const ordersByPartner = Array.from(partnerMap.values());

    // Generate revenue trend for the last 7 days
    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.date_created);
        return orderDate >= date && orderDate < nextDate;
      });
      
      revenueTrend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayOrders.reduce((sum, order) => sum + (order.amount || 0), 0),
        orders: dayOrders.length
      });
    }

    // Transform orders for the data table
    const reportDataItems = orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      city: order.city,
      partner: order.partner,
      status: order.status,
      amount: order.amount || 0,
      orderDate: order.date_created,
      completionDate: order.date_modified,
      timeToComplete: order.date_modified && order.date_created ? 
        Math.ceil((new Date(order.date_modified).getTime() - new Date(order.date_created).getTime()) / (1000 * 60 * 60 * 24)) : undefined
    }));

    const response = {
      reportData: {
        items: reportDataItems,
        totalCount: totalOrders,
        totalRevenue,
        averageOrderValue
      },
      summaryStats: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersThisMonth,
        revenueThisMonth,
        completionRate: Math.round(completionRate),
        newOrdersToday,
        pendingOrders
      },
      chartData: {
        ordersByStatus,
        ordersByMonth,
        ordersByCity,
        ordersByPartner,
        revenueTrend
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
