import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ServiceDashboardStats } from '@/types/services';

// GET /api/services/stats - Get services dashboard statistics
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching services dashboard statistics');

    // Get total services count
    const { count: totalServices, error: servicesError } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true });

    if (servicesError) {
      console.error('❌ Error counting services:', servicesError);
      return NextResponse.json(
        { success: false, error: 'Failed to count services', details: servicesError.message },
        { status: 500 }
      );
    }

    // Get active services count
    const { count: activeServices, error: activeError } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (activeError) {
      console.error('❌ Error counting active services:', activeError);
      return NextResponse.json(
        { success: false, error: 'Failed to count active services', details: activeError.message },
        { status: 500 }
      );
    }

    // Get total providers count (from partner_services table)
    const { count: totalProviders, error: providersError } = await supabase
      .from('partner_services')
      .select('partner_id', { count: 'exact', head: true });

    if (providersError) {
      console.error('❌ Error counting total providers:', providersError);
      return NextResponse.json(
        { success: false, error: 'Failed to count total providers', details: providersError.message },
        { status: 500 }
      );
    }

    // Since we don't have total_orders, average_rating, or total_revenue in our simplified schema,
    // we'll set these to 0 for now. They can be calculated later when we have more data.
    const totalOrders = 0;
    const averageRating = 0;
    const totalRevenue = 0;

    const stats: ServiceDashboardStats = {
      total_services: totalServices || 0,
      active_services: activeServices || 0,
      total_providers: totalProviders || 0,
      total_orders: totalOrders,
      average_rating: averageRating,
      total_revenue: totalRevenue
    };

    console.log('✅ Successfully fetched services statistics:', stats);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Unexpected error in GET /api/services/stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
