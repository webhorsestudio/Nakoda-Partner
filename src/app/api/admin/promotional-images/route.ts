import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/auth';
import { PromotionalImage, PromotionalImageFilters, CreatePromotionalImageRequest } from '@/types/promotionalImages';

// GET /api/admin/promotional-images - Fetch promotional images with filters
export async function GET(request: NextRequest) {
  try {
    console.log('=== PROMOTIONAL IMAGES API DEBUG ===');
    
    // Check admin authentication using JWT token
    const authResult = await verifyAdminToken(request);
    console.log('Auth check:', { success: authResult.success, error: authResult.error });
    
    if (!authResult.success) {
      console.log('Authentication failed:', authResult.error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const is_active = searchParams.get('is_active');
    const target_audience = searchParams.get('target_audience');
    const action_type = searchParams.get('action_type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    let query = supabase
      .from('promotional_images')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%,brand_name.ilike.%${search}%`);
    }
    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }
    if (target_audience) {
      query = query.eq('target_audience', target_audience);
    }
    if (action_type) {
      query = query.eq('action_type', action_type);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('display_order', { ascending: true });

    const { data: images, error, count } = await query;

    console.log('Query result:', { imagesCount: images?.length, error: error?.message, count });

    if (error) {
      console.error('Error fetching promotional images:', error);
      return NextResponse.json({ error: 'Failed to fetch promotional images' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      images: images || [],
      pagination: {
        page,
        limit,
        totalItems: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error in promotional images API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/promotional-images - Create new promotional image
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication using JWT token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreatePromotionalImageRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.image_url) {
      return NextResponse.json({ error: 'Title and image URL are required' }, { status: 400 });
    }

    // Get admin user ID from auth result
    const adminUserId = authResult.userId;

    const imageData = {
      title: body.title,
      subtitle: body.subtitle || '',
      button_text: body.button_text || 'Learn More',
      brand_name: body.brand_name || 'Nakoda Partner',
      image_url: body.image_url,
      image_alt: body.image_alt || body.title,
      gradient_from: body.gradient_from || 'blue-600',
      gradient_to: body.gradient_to || 'indigo-600',
      display_order: body.display_order || 0,
      auto_rotate_duration: body.auto_rotate_duration || 5000,
      action_type: body.action_type || 'button',
      action_url: body.action_url || '',
      action_target: body.action_target || '_self',
      target_audience: body.target_audience || 'all',
      created_by: adminUserId || null,
      expires_at: body.expires_at || null
    };

    const { data: newImage, error } = await supabase
      .from('promotional_images')
      .insert([imageData])
      .select()
      .single();

    if (error) {
      console.error('Error creating promotional image:', error);
      return NextResponse.json({ error: 'Failed to create promotional image' }, { status: 500 });
    }

    return NextResponse.json({ image: newImage }, { status: 201 });

  } catch (error) {
    console.error('Error in create promotional image API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
