import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPartnerToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify partner authentication
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const partnerId = authResult.userId;
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    // Get partner information
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, name, city, service_categories, service_type, status')
      .eq('id', partnerId)
      .eq('status', 'active')
      .single();

    if (partnerError || !partner) {
      console.error('Partner not found:', partnerError);
      return NextResponse.json(
        { error: 'Partner not found or inactive' },
        { status: 404 }
      );
    }

    // Fetch the specific order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        bitrix24_id,
        title,
        service_type,
        specification,
        status,
        amount,
        currency,
        customer_name,
        mobile_number,
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
        taxes_and_fees,
        partner_id
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is available for this partner
    // Only show orders that are pending and not assigned to any partner
    if (order.status !== 'pending' || order.partner_id) {
      return NextResponse.json(
        { error: 'Order is not available' },
        { status: 403 }
      );
    }

    // Transform order to match OrderDetails interface
    const orderDetails = {
      id: order.id,
      title: order.title || 'Service Request',
      description: order.specification || order.title || 'Service request',
      customerName: order.customer_name || 'Customer',
      customerPhone: order.mobile_number || '',
      customerEmail: '', // Not available in current schema
      customerAddress: order.address || '',
      customerCity: order.city || 'Unknown City',
      customerPinCode: order.pin_code || '',
      location: `${order.city || 'Unknown City'}${order.pin_code ? ` - ${order.pin_code}` : ''}`,
      amount: parseFloat(order.amount?.toString() || '0'),
      advanceAmount: parseFloat(order.advance_amount?.toString() || '0'),
      balanceAmount: parseFloat(order.amount?.toString() || '0') - parseFloat(order.advance_amount?.toString() || '0'),
      serviceType: order.service_type || 'General Service',
      priority: 'medium', // Default priority
      estimatedDuration: order.time_slot || '2-4 hours',
      createdAt: order.date_created || order.created_at,
      status: order.status || 'pending',
      serviceDate: order.service_date,
      serviceTime: order.time_slot,
      orderNumber: order.order_number || `ORD-${order.id}`,
      category: order.service_type || 'General',
      subcategory: order.service_type || 'General',
      serviceInstructions: order.specification || 'Please follow standard service procedures.',
      specialRequirements: 'None specified',
      requirements: 'Standard service requirements apply',
      commissionPercentage: order.commission_percentage || '25%',
      commissionAmount: Math.round((parseFloat(order.amount?.toString() || '0') * parseFloat((order.commission_percentage || '25').replace('%', ''))) / 100),
      taxesAndFees: parseFloat(order.taxes_and_fees?.toString() || '0'),
      isUrgent: false, // Default value
      tags: [order.service_type || 'General'],
      attachments: []
    };

    console.log(`Returning order details for order ${orderId} to partner ${partner.name}`);
    
    return NextResponse.json({
      success: true,
      order: orderDetails,
      partner: {
        id: partner.id,
        name: partner.name,
        city: partner.city,
        serviceType: partner.service_type
      }
    });

  } catch (error) {
    console.error('Error in order details API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST endpoint to accept an order from the details page
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify partner authentication
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const partnerId = authResult.userId;
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    // First, get the order details to check advance amount
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, advance_amount, status, partner_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'pending' || order.partner_id) {
      return NextResponse.json(
        { error: 'Order is not available' },
        { status: 403 }
      );
    }

    const advanceAmount = parseFloat(order.advance_amount?.toString() || '0');

    // Get partner's current wallet balance
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('wallet_balance')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    const currentBalance = parseFloat(partner.wallet_balance?.toString() || '0');

    // Check if partner has sufficient balance
    if (currentBalance < advanceAmount) {
      return NextResponse.json(
        { 
          error: 'Insufficient wallet balance',
          message: `You need ₹${advanceAmount} but only have ₹${currentBalance}`,
          requiredAmount: advanceAmount,
          currentBalance: currentBalance
        },
        { status: 400 }
      );
    }

    // Start a transaction to update order and deduct from wallet
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        partner_id: partnerId,
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error accepting order:', updateError);
      return NextResponse.json(
        { error: 'Failed to accept order', details: updateError.message },
        { status: 500 }
      );
    }

    // Deduct advance amount from partner's wallet
    const newBalance = currentBalance - advanceAmount;
    const { error: walletError } = await supabase
      .from('partners')
      .update({
        wallet_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', partnerId);

    if (walletError) {
      console.error('Error updating wallet:', walletError);
      // Rollback order update
      await supabase
        .from('orders')
        .update({
          partner_id: null,
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      return NextResponse.json(
        { error: 'Failed to update wallet', details: walletError.message },
        { status: 500 }
      );
    }

    // Create wallet transaction record
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        partner_id: partnerId,
        type: 'debit',
        amount: advanceAmount,
        description: `Advance payment for order ${orderId}`,
        balance_after: newBalance,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      // Don't fail the request for this, just log it
    }

    console.log(`Order ${orderId} accepted by partner ${partnerId}, advance amount: ₹${advanceAmount}`);

    return NextResponse.json({
      success: true,
      message: 'Order accepted successfully',
      orderId: orderId,
      advanceAmount: advanceAmount,
      newBalance: newBalance
    });

  } catch (error) {
    console.error('Error accepting order:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
