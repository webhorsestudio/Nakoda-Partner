import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

interface DeleteOrderRequest {
  orderId: string;
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const { orderId }: DeleteOrderRequest = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Admin deleting order: ${orderId}`);

    // First, check if the order exists
    const { data: existingOrder, error: checkError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, customer_name, status, partner_id')
      .eq('id', orderId)
      .single();

    if (checkError || !existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is assigned to a partner
    if (existingOrder.partner_id) {
      return NextResponse.json(
        { 
          error: 'Cannot delete assigned order', 
          message: 'This order is assigned to a partner and cannot be deleted. Please unassign the partner first.',
          orderNumber: existingOrder.order_number,
          partnerId: existingOrder.partner_id
        },
        { status: 409 }
      );
    }

    // Delete the order
    const { error: deleteError } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (deleteError) {
      console.error('Error deleting order:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete order', details: deleteError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Order ${existingOrder.order_number} successfully deleted`);

    return NextResponse.json({
      success: true,
      message: `Order ${existingOrder.order_number} has been successfully deleted`,
      deletedOrder: {
        id: existingOrder.id,
        orderNumber: existingOrder.order_number,
        customerName: existingOrder.customer_name,
        status: existingOrder.status
      }
    });

  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
