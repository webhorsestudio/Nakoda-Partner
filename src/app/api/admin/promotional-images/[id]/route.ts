import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/auth';
import { UpdatePromotionalImageRequest } from '@/types/promotionalImages';
import { cleanTimestampFields } from '@/utils/timestampUtils';

// GET /api/admin/promotional-images/[id] - Get single promotional image
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication using JWT token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { data: image, error } = await supabase
      .from('promotional_images')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (error) {
      console.error('Error fetching promotional image:', error);
      return NextResponse.json({ error: 'Promotional image not found' }, { status: 404 });
    }

    return NextResponse.json({ image });

  } catch (error) {
    console.error('Error in get promotional image API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/promotional-images/[id] - Update promotional image
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication using JWT token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdatePromotionalImageRequest = await request.json();
    const { id, ...updateData } = body;

    // Remove undefined values and clean timestamp fields
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    const cleanUpdateData = cleanTimestampFields(filteredData);

    const resolvedParams = await params;
    
    console.log('Updating promotional image:', {
      id: resolvedParams.id,
      updateData: cleanUpdateData
    });

    const { data: updatedImage, error } = await supabase
      .from('promotional_images')
      .update(cleanUpdateData)
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating promotional image:', {
        error,
        id: resolvedParams.id,
        updateData: cleanUpdateData
      });
      return NextResponse.json({ 
        error: 'Failed to update promotional image',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ image: updatedImage });

  } catch (error) {
    console.error('Error in update promotional image API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/promotional-images/[id] - Delete promotional image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication using JWT token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { error } = await supabase
      .from('promotional_images')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      console.error('Error deleting promotional image:', error);
      return NextResponse.json({ error: 'Failed to delete promotional image' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Promotional image deleted successfully' });

  } catch (error) {
    console.error('Error in delete promotional image API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
