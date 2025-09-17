import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/auth';
import { PromotionalImageStats } from '@/types/promotionalImages';

// GET /api/admin/promotional-images/stats - Get promotional images statistics
export async function GET(request: NextRequest) {
  try {
    console.log('=== PROMOTIONAL IMAGES STATS API DEBUG ===');
    
    // Check admin authentication using JWT token
    const authResult = await verifyAdminToken(request);
    console.log('Auth check:', { success: authResult.success, error: authResult.error });
    
    if (!authResult.success) {
      console.log('Authentication failed:', authResult.error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total counts
    const { count: totalImages } = await supabase
      .from('promotional_images')
      .select('*', { count: 'exact', head: true });

    const { count: activeImages } = await supabase
      .from('promotional_images')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: inactiveImages } = await supabase
      .from('promotional_images')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false);

    // Get analytics data
    const { data: analyticsData } = await supabase
      .from('promotional_image_analytics')
      .select('event_type, image_id');

    const totalViews = analyticsData?.filter(a => a.event_type === 'view').length || 0;
    const totalClicks = analyticsData?.filter(a => a.event_type === 'click').length || 0;
    const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    // Get top performing image
    const { data: topImageData } = await supabase
      .from('promotional_images')
      .select(`
        id,
        title,
        promotional_image_analytics!inner(event_type)
      `)
      .eq('is_active', true);

    // Calculate views and clicks per image
    const imageStats = topImageData?.reduce((acc: Record<number, { id: number; title: string; views: number; clicks: number }>, image: { id: number; title: string; promotional_image_analytics?: { event_type: string }[] }) => {
      const views = image.promotional_image_analytics?.filter((a: { event_type: string }) => a.event_type === 'view').length || 0;
      const clicks = image.promotional_image_analytics?.filter((a: { event_type: string }) => a.event_type === 'click').length || 0;
      
      if (!acc[image.id]) {
        acc[image.id] = {
          id: image.id,
          title: image.title,
          views,
          clicks
        };
      }
      
      return acc;
    }, {});

    const topPerformingImage = imageStats ? Object.values(imageStats)
      .sort((a: { views: number }, b: { views: number }) => b.views - a.views)[0] || null : null;

    const stats: PromotionalImageStats = {
      total_images: totalImages || 0,
      active_images: activeImages || 0,
      inactive_images: inactiveImages || 0,
      total_views: totalViews,
      total_clicks: totalClicks,
      click_through_rate: Math.round(clickThroughRate * 100) / 100,
      top_performing_image: topPerformingImage
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error in promotional images stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
