import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/services - List all services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const is_active = searchParams.get('is_active');

    let query = supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply status filter
    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data: services, error, count } = await query;

    if (error) {
      console.error('Error fetching services:', error);
      return NextResponse.json(
        { error: 'Failed to fetch services', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      services: services || [],
      total: count || 0
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/services - Create a new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, is_active } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      );
    }

    // Create the service
    const { data: service, error } = await supabase
      .from('services')
      .insert([
        {
          name: name.trim(),
          description: description?.trim() || null,
          is_active: is_active !== undefined ? is_active : true
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error);
      return NextResponse.json(
        { error: 'Failed to create service', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ service }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
