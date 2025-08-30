import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/services/[id] - Get a single service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching service:', error);
      return NextResponse.json(
        { error: 'Failed to fetch service', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ service });

  } catch (error) {
    console.error('Unexpected error in GET /api/services/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/services/[id] - Update a service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, is_active } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      );
    }

    // Update the service
    const { data: service, error } = await supabase
      .from('services')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }
      console.error('Error updating service:', error);
      return NextResponse.json(
        { error: 'Failed to update service', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ service });

  } catch (error) {
    console.error('Unexpected error in PUT /api/services/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[id] - Delete a service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if service exists
    const { data: existingService, error: checkError } = await supabase
      .from('services')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Delete the service
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting service:', error);
      return NextResponse.json(
        { error: 'Failed to delete service', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Service deleted successfully' });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/services/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
