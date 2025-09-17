import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPartnerToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = authResult.userId;
    const { id: orderId } = await params;

    console.log('Fetching order details:', { partnerId, orderId });

    // First, check if the order exists at all
    const { data: orderExists, error: existsError } = await supabase
      .from('orders')
      .select('id, partner_id, status')
      .eq('id', orderId)
      .single();

    if (existsError) {
      console.error('Order existence check failed:', existsError);
      return NextResponse.json({ 
        error: 'Order not found', 
        details: `Order with ID ${orderId} does not exist`,
        debug: { orderId, partnerId, existsError: existsError.message }
      }, { status: 404 });
    }

    if (!orderExists) {
      console.error('Order does not exist:', { orderId, partnerId });
      return NextResponse.json({ 
        error: 'Order not found', 
        details: `Order with ID ${orderId} does not exist`,
        debug: { orderId, partnerId }
      }, { status: 404 });
    }

    console.log('Order exists:', { 
      orderId: orderExists.id, 
      partnerId: orderExists.partner_id, 
      status: orderExists.status,
      requestedPartnerId: partnerId 
    });

    // Check if the order belongs to this partner
    if (orderExists.partner_id !== partnerId) {
      console.error('Order does not belong to partner:', { 
        orderId, 
        orderPartnerId: orderExists.partner_id, 
        requestedPartnerId: partnerId 
      });
      return NextResponse.json({ 
        error: 'Access denied', 
        details: 'This order does not belong to you',
        debug: { orderId, orderPartnerId: orderExists.partner_id, requestedPartnerId: partnerId }
      }, { status: 403 });
    }

    // Fetch the full order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        title,
        specification,
        status,
        amount,
        customer_name,
        mobile_number,
        address,
        city,
        pin_code,
        service_date,
        time_slot,
        date_created,
        partner_id,
        advance_amount,
        commission_percentage,
        service_type,
        bitrix24_id,
        order_number,
        currency,
        created_at,
        updated_at
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching ongoing order details:', orderError);
      console.error('Order error details:', { orderError, partnerId, orderId });
      return NextResponse.json({ 
        error: 'Failed to fetch order details', 
        details: orderError.message,
        debug: { orderId, partnerId, orderError: orderError.message }
      }, { status: 500 });
    }

    if (!order) {
      console.error('No order found after successful query:', { partnerId, orderId });
      return NextResponse.json({ 
        error: 'Order not found', 
        details: 'Order data is null after successful query',
        debug: { orderId, partnerId }
      }, { status: 404 });
    }

    console.log('Order found successfully:', { orderId: order.id, partnerId: order.partner_id, status: order.status });

    // Calculate financial details
    const totalAmount = parseFloat(order.amount?.toString() || '0');
    const advanceAmount = parseFloat(order.advance_amount?.toString() || '0');
    const commissionPercentage = parseFloat(order.commission_percentage?.toString() || '10');
    const commissionAmount = (totalAmount * commissionPercentage) / 100;
    const balanceAmount = totalAmount - advanceAmount;

    // Transform the order data to match the OngoingOrderDetails interface
    const transformedOrder = {
      id: order.id,
      title: order.title || 'Service Request',
      description: order.specification || 'Service description not available',
      customerName: order.customer_name || 'Customer',
      location: `${order.city || 'Unknown City'}${order.pin_code ? ` - ${order.pin_code}` : ''}`,
      amount: totalAmount,
      duration: order.time_slot || '2-4 hours',
      serviceType: order.service_type || 'General Service',
      orderNumber: order.order_number || order.bitrix24_id || order.id,
      orderDate: new Date(order.date_created || order.created_at).toISOString().split('T')[0],
      serviceDate: order.service_date || new Date().toISOString().split('T')[0],
      serviceTime: order.time_slot || 'Not specified',
      status: order.status as 'in-progress' | 'completed' | 'cancelled' | 'assigned',
      startTime: order.status === 'in-progress' ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : undefined,
      estimatedEndTime: order.time_slot ? 
        new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : undefined,
      actualStartTime: order.status === 'in-progress' ? 
        new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : undefined,
      currentPhase: order.status === 'completed' ? 'Completed' : 
                   order.status === 'in-progress' ? 'In Progress' : 
                   order.status === 'assigned' ? 'Assigned' : 'Unknown',
      notes: order.specification || '',
      photos: [],
      customerPhone: order.mobile_number || '',
      customerAddress: order.address || '',
      advanceAmount: advanceAmount,
      balanceAmount: balanceAmount,
      commissionAmount: commissionAmount,
      
      // Additional fields for order details
      customerEmail: '', // Email field doesn't exist in database
      customerCity: order.city || '',
      customerPinCode: order.pin_code || '',
      serviceInstructions: order.specification || '', // Use specification as instructions
      specialRequirements: '', // Field doesn't exist in database
      requirements: '', // Field doesn't exist in database
      category: order.service_type || 'General',
      subcategory: '', // Field doesn't exist in database
      
      // Financial details
      totalAmount: totalAmount,
      commissionPercentage: `${commissionPercentage}%`,
      taxesAndFees: 0, // Default to 0
      
      // Partner details
      assignedPartner: 'Partner', // TODO: Get partner name from database
      partnerNotes: '', // Field doesn't exist in database
      
      // Additional info
      isUrgent: false, // Field doesn't exist in database
      isExclusive: false, // Field doesn't exist in database
      tags: [], // Field doesn't exist in database
      attachments: [] // Field doesn't exist in database
    };

    return NextResponse.json({
      success: true,
      order: transformedOrder,
      partner: {
        id: partnerId,
        name: 'Partner', // TODO: Get partner name from database
        city: 'Unknown', // TODO: Get partner city from database
        serviceType: 'General' // TODO: Get partner service type from database
      }
    });

  } catch (error) {
    console.error('Ongoing order details API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
