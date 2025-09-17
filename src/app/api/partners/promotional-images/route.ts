import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPartnerToken } from '@/lib/auth';
import { PromotionalImage } from '@/types/promotionalImages';

// GET /api/partners/promotional-images - Fetch active promotional images for partners
export async function GET(request: NextRequest) {
  try {
    console.log('=== PARTNER PROMOTIONAL IMAGES API DEBUG ===');
    
    // Check partner authentication using JWT token
    const authResult = await verifyPartnerToken(request);
    console.log('Auth check:', { success: authResult.success, error: authResult.error });
    
    if (!authResult.success) {
      console.log('Authentication failed:', authResult.error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const target_audience = searchParams.get('target_audience') || 'all';

    // Build query for active images only
    let query = supabase
      .from('active_promotional_images')
      .select('*')
      .order('display_order', { ascending: true });

    // Filter by target audience
    if (target_audience !== 'all') {
      query = query.or(`target_audience.eq.${target_audience},target_audience.eq.all`);
    }

    const { data: images, error } = await query;

    if (error) {
      console.error('Error fetching promotional images:', error);
      return NextResponse.json({ error: 'Failed to fetch promotional images' }, { status: 500 });
    }

    // Track view analytics for each image
    if (images && images.length > 0) {
      const analyticsData = images.map(image => ({
        image_id: image.id,
        event_type: 'view',
        session_id: request.headers.get('x-session-id') || 'unknown',
        user_agent: request.headers.get('user-agent') || '',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        referrer: request.headers.get('referer') || ''
      }));

      // Insert analytics data (don't wait for completion)
      supabase
        .from('promotional_image_analytics')
        .insert(analyticsData)
        .then(({ error: analyticsError }) => {
          if (analyticsError) {
            console.error('Error tracking promotional image views:', analyticsError);
          }
        });
    }

    return NextResponse.json({ images: images || [] });

  } catch (error) {
    console.error('Error in promotional images API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/partners/promotional-images/click - Track click analytics
export async function POST(request: NextRequest) {
  try {
    console.log('=== PARTNER PROMOTIONAL IMAGES CLICK API DEBUG ===');
    
    // Check partner authentication using JWT token
    const authResult = await verifyPartnerToken(request);
    console.log('Auth check:', { success: authResult.success, error: authResult.error });
    
    if (!authResult.success) {
      console.log('Authentication failed:', authResult.error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_id } = await request.json();

    if (!image_id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    // Track click analytics
    const { error: analyticsError } = await supabase
      .from('promotional_image_analytics')
      .insert([{
        image_id,
        event_type: 'click',
        session_id: request.headers.get('x-session-id') || 'unknown',
        user_agent: request.headers.get('user-agent') || '',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        referrer: request.headers.get('referer') || ''
      }]);

    if (analyticsError) {
      console.error('Error tracking promotional image click:', analyticsError);
      return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
    }

    // Update click count on the image
    const { data: currentImage, error: fetchError } = await supabase
      .from('promotional_images')
      .select('click_count')
      .eq('id', image_id)
      .single();

    if (!fetchError && currentImage) {
      const { error: updateError } = await supabase
        .from('promotional_images')
        .update({ click_count: (currentImage.click_count || 0) + 1 })
        .eq('id', image_id);

      if (updateError) {
        console.error('Error updating click count:', updateError);
      }
    }

    return NextResponse.json({ message: 'Click tracked successfully' });

  } catch (error) {
    console.error('Error in promotional image click API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
