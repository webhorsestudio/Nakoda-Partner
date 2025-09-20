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
    const customerRating = parseInt(formData.get('customerRating') as string);
    const completionNotes = formData.get('completion_notes') as string;
    const images = formData.getAll('images') as File[];

    // Validate required fields
    if (!customerRating || customerRating < 1 || customerRating > 5) {
      return NextResponse.json(
        { error: 'Customer rating is required and must be between 1 and 5 stars' },
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
      .select('id, partner_id, status, partner_completion_status, mode, advance_amount')
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
        
        console.log('🔄 Starting image upload process...');
        console.log('📊 Upload details:', {
          imageCount: images.length,
          orderId,
          partnerId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        });
        
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const fileExtension = image.name.split('.').pop() || 'jpg';
          const fileName = `${orderId}_${partnerId}_${Date.now()}_${i}.${fileExtension}`;
          const filePath = `task-completion-images/${fileName}`;

          console.log(`📤 Uploading image ${i + 1}/${images.length}:`, {
            originalName: image.name,
            fileName: fileName,
            filePath: filePath,
            fileSize: image.size,
            fileType: image.type
          });

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
            console.error('❌ Error uploading image:', uploadError);
            console.error('📊 Upload error details:', {
              error: uploadError,
              fileName: fileName,
              filePath: filePath,
              fileSize: image.size,
              fileType: image.type,
              supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
              hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            });
            return NextResponse.json(
              { error: `Failed to upload image: ${image.name}. Error: ${uploadError.message}` },
              { status: 500 }
            );
          }

          console.log('✅ Image uploaded successfully:', uploadData);

          // Get public URL using admin client
          const { data: urlData } = supabaseAdmin.storage
            .from('task-completion-images')
            .getPublicUrl(filePath);

          console.log('🔗 Generated public URL:', urlData.publicUrl);
          uploadedImageUrls.push(urlData.publicUrl);
        }
        
        console.log('✅ All images uploaded successfully:', uploadedImageUrls);

    // Update order with completion data
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        customer_rating: customerRating,
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

    // Handle wallet refund for Online payment mode orders
    let walletRefund = null;
    if (order.mode === 'Online' || order.mode === 'online') {
      try {
        const advanceAmount = parseFloat(order.advance_amount?.toString() || '0');
        
        if (advanceAmount > 0) {
          console.log('🔄 Processing wallet refund for Online order:', {
            orderId,
            partnerId,
            advanceAmount,
            paymentMode: order.mode
          });

          // Get current partner wallet balance
          const { data: partner, error: partnerError } = await supabaseAdmin
            .from('partners')
            .select('wallet_balance')
            .eq('id', partnerId)
            .single();

          if (partnerError || !partner) {
            console.error('Error fetching partner wallet:', partnerError);
            // Don't fail the completion, just log the error
          } else {
            const currentBalance = parseFloat(partner.wallet_balance?.toString() || '0');
            const newBalance = currentBalance + advanceAmount;

            // Update partner wallet balance
            const { error: walletUpdateError } = await supabaseAdmin
              .from('partners')
              .update({
                wallet_balance: newBalance,
                updated_at: new Date().toISOString()
              })
              .eq('id', partnerId);

            if (walletUpdateError) {
              console.error('Error updating partner wallet:', walletUpdateError);
              // Don't fail the completion, just log the error
            } else {
              // Create wallet transaction record for refund
              const { error: transactionError } = await supabaseAdmin
                .from('wallet_transactions')
                .insert({
                  partner_id: partnerId,
                  transaction_type: 'refund',
                  amount: advanceAmount,
                  balance_before: currentBalance,
                  balance_after: newBalance,
                  description: `Advance amount refund for completed order ${orderId}`,
                  reference_id: orderId,
                  reference_type: 'order_completion_refund',
                  status: 'completed',
                  metadata: {
                    order_id: orderId,
                    order_title: updatedOrder.title || 'Service Order',
                    customer_name: updatedOrder.customer_name || 'Unknown Customer',
                    payment_mode: order.mode,
                    original_advance_amount: advanceAmount
                  },
                  processed_at: new Date().toISOString()
                });

              if (transactionError) {
                console.error('Error creating wallet transaction:', transactionError);
                // Don't fail the completion, just log the error
              } else {
                walletRefund = {
                  refunded: true,
                  amount: advanceAmount,
                  previousBalance: currentBalance,
                  newBalance: newBalance,
                  paymentMode: order.mode
                };
                console.log('✅ Wallet refund processed successfully:', walletRefund);
              }
            }
          }
        }
      } catch (refundError) {
        console.error('Error processing wallet refund:', refundError);
        // Don't fail the completion, just log the error
      }
    } else {
      console.log('ℹ️ No wallet refund needed for payment mode:', order.mode);
    }

    return NextResponse.json({
      success: true,
      message: 'Task completed successfully',
      data: {
        orderId: updatedOrder.id,
        completedAt: updatedOrder.completed_at,
        customerRating: updatedOrder.customer_rating,
        imageCount: uploadedImageUrls.length,
        imageUrls: uploadedImageUrls,
        walletRefund: walletRefund
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
        customer_rating,
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
