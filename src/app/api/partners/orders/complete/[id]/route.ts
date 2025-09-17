import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { verifyPartnerToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Verify partner authentication
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId: partnerId } = authResult;

    // Parse form data (multipart/form-data for file upload)
    const formData = await request.formData();
    const feedback = formData.get('feedback') as string;
    const completionNotes = formData.get('completion_notes') as string;
    const images = formData.getAll('images') as File[];

    // Validate required fields
    if (!feedback || feedback.trim().length < 10) {
      return NextResponse.json(
        { error: 'Feedback is required and must be at least 10 characters long' },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'At least one completion image is required' },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    for (const image of images) {
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${image.type}. Allowed types: ${allowedTypes.join(', ')}` },
          { status: 400 }
        );
      }
      
      if (image.size > maxFileSize) {
        return NextResponse.json(
          { error: `File too large: ${image.name}. Maximum size is 10MB` },
          { status: 400 }
        );
      }
    }

    // Check if order exists and belongs to the partner
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, partner_id, status, partner_completion_status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.partner_id !== partnerId) {
      return NextResponse.json(
        { error: 'Unauthorized to complete this order' },
        { status: 403 }
      );
    }

    // Check if order is already completed
    if (order.partner_completion_status === 'completed') {
      return NextResponse.json(
        { error: 'Order is already completed' },
        { status: 400 }
      );
    }

    // Upload images to Supabase Storage
    const uploadedImageUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const fileExtension = image.name.split('.').pop() || 'jpg';
      const fileName = `${orderId}_${partnerId}_${Date.now()}_${i}.${fileExtension}`;
      const filePath = `task-completion-images/${fileName}`;

      // Convert File to ArrayBuffer
      const arrayBuffer = await image.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Upload to Supabase Storage using admin client
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('task-completion-images')
        .upload(filePath, uint8Array, {
          contentType: image.type,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return NextResponse.json(
          { error: `Failed to upload image: ${image.name}` },
          { status: 500 }
        );
      }

      // Get public URL using admin client
      const { data: urlData } = supabaseAdmin.storage
        .from('task-completion-images')
        .getPublicUrl(filePath);

      uploadedImageUrls.push(urlData.publicUrl);
    }

    // Update order with completion data
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        partner_feedback: feedback.trim(),
        completion_images: uploadedImageUrls,
        completed_at: new Date().toISOString(),
        partner_completion_status: 'completed',
        completion_notes: completionNotes?.trim() || null,
        status: 'completed', // Also update the main status
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task completed successfully',
      data: {
        orderId: updatedOrder.id,
        completedAt: updatedOrder.completed_at,
        feedback: updatedOrder.partner_feedback,
        imageCount: uploadedImageUrls.length,
        imageUrls: uploadedImageUrls
      }
    });

  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve task completion data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Verify partner authentication
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId: partnerId } = authResult;

    // Get order completion data
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        partner_feedback,
        completion_images,
        completed_at,
        partner_completion_status,
        completion_notes,
        status
      `)
      .eq('id', orderId)
      .eq('partner_id', partnerId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching task completion data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
