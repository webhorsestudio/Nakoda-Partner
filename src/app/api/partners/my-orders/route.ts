import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Partner-only authentication
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const partnerId = authResult.userId;

    console.log(`🔍 Partner ${partnerId} requesting assigned orders`);

    // Verify partner exists and is active
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, name, city, service_type, status, wallet_balance')
      .eq('id', partnerId)
      .eq('status', 'active')
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { error: 'Partner not found or inactive' },
        { status: 404 }
      );
    }

    // Build query for partner's assigned orders
    const query = supabase
      .from('orders')
      .select(`
        id,
        bitrix24_id,
        title,
        mode,
        service_type,
        specification,
        status,
        amount,
        currency,
        customer_name,
        address,
        city,
        pin_code,
        advance_amount,
        commission_percentage,
        service_date,
        time_slot,
        date_created,
        created_at,
        order_number,
        mobile_number,
        package
      `)
      .eq('partner_id', partnerId) // Only orders assigned to this partner
      .order('created_at', { ascending: false }) // Latest first
      .limit(50);

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error('Error fetching partner orders:', ordersError);
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: ordersError.message },
        { status: 500 }
      );
    }

    // Transform orders for partner interface
    const transformedOrders = orders?.map(order => ({
      id: order.id,
      title: order.title || 'Service Request',
      description: order.specification || order.title || 'Service request',
      customerName: order.customer_name || 'Customer',
      customerPhone: order.mobile_number || '',
      location: `${order.city || 'Unknown City'}${order.pin_code ? ` - ${order.pin_code}` : ''}`,
      amount: parseFloat(order.amount?.toString() || '0'),
      advanceAmount: parseFloat(order.advance_amount?.toString() || '0'),
      serviceType: order.service_type || 'General Service',
      priority: 'medium', // Default priority
      estimatedDuration: order.time_slot || '2-4 hours',
      createdAt: order.date_created || order.created_at,
      status: order.status || 'assigned',
      serviceDate: order.service_date,
      timeSlot: order.time_slot,
      mode: order.mode || null,
      orderNumber: order.order_number,
      package: order.package
    })) || [];

    console.log(`✅ Partner ${partnerId} assigned orders: ${transformedOrders.length}`);

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      total: transformedOrders.length,
      userType: 'partner',
      partner: {
        id: partner.id,
        name: partner.name,
        city: partner.city,
        serviceType: partner.service_type,
        walletBalance: partner.wallet_balance
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Partner my-orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST endpoint for partner to update order status (complete, cancel, etc.)
export async function POST(request: NextRequest) {
  try {
    // Partner-only authentication
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const partnerId = authResult.userId;
    const { orderId, action, notes } = await request.json();

    if (!orderId || !action) {
      return NextResponse.json(
        { error: 'Order ID and action are required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Partner ${partnerId} ${action} order ${orderId}`);

    // Update order status based on action
    const baseUpdateData = {
      updated_at: new Date().toISOString()
    };

    let updateData: { [key: string]: unknown };
    
    switch (action) {
      case 'complete':
        updateData = {
          ...baseUpdateData,
          status: 'completed',
          completed_at: new Date().toISOString()
        };
        break;
      case 'cancel':
        updateData = {
          ...baseUpdateData,
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        };
    break;
      case 'start':
        updateData = {
          ...baseUpdateData,
          status: 'in_progress',
          started_at: new Date().toISOString()
        };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (notes) {
      updateData.partner_notes = notes;
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .eq('partner_id', partnerId) // Ensure partner can only update their own orders
      .select('id, status, title, order_number')
      .single();

    if (updateError || !updatedOrder) {
      console.error('Error updating order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order', details: updateError?.message },
        { status: 500 }
      );
    }

    console.log(`✅ Order ${orderId} ${action} completed by partner ${partnerId}`);

    return NextResponse.json({
      success: true,
      message: `Order ${updatedOrder.order_number} ${action} successfully`,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Partner update order error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
