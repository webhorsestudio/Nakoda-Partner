import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { id, updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Validate ID format (should be a valid UUID)
    if (typeof id !== 'string' || id.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    // Remove fields that shouldn't be updated
    const { ...safeUpdates } = updates;

    // Validate and convert data types to match database schema
    const validatedUpdates: Record<string, string | number | null> = {};
    
    for (const [key, value] of Object.entries(safeUpdates)) {
      if (value !== null && value !== undefined) {
        // Convert amount to decimal if it's a number
        if (key === 'amount' && typeof value === 'string') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            validatedUpdates[key] = numValue;
          } else {
            validatedUpdates[key] = value; // Keep as string if conversion fails
          }
        } else {
          validatedUpdates[key] = value as string | number | null;
        }
      }
    }

    // Add updated timestamp
    const updateData = {
      ...validatedUpdates,
      date_modified: new Date().toISOString()
    };

    // Test Supabase connection first
    try {
      const { error: connectionError } = await supabase
        .from('orders')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        console.error('Supabase connection test failed:', connectionError);
        return NextResponse.json(
          { error: 'Database connection failed', details: connectionError.message },
          { status: 500 }
        );
      }
    } catch (connectionTestError) {
      console.error('Supabase connection test error:', connectionTestError);
      return NextResponse.json(
        { error: 'Database connection test failed' },
        { status: 500 }
      );
    }

    // First, verify the order exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id, bitrix24_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching existing order:', fetchError);
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Database error while fetching order', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: 'Failed to update order', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data
    });

  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
