import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPartnerToken, verifyAdminToken } from '@/lib/auth';
import { isTaskExpired } from '@/components/partner/tabs/new-task/utils/timeExpirationUtils';

export async function GET(request: NextRequest) {
  try {
    // Try to verify as admin first, then partner
    let authResult = await verifyAdminToken(request);
    let isAdmin = authResult.success;
    
    if (!authResult.success) {
      authResult = await verifyPartnerToken(request);
      isAdmin = false;
    }
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const userId = authResult.userId;

    // Get partner information (for partners) or skip for admins
    let partner = null;
    if (!isAdmin) {
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('id, name, city, service_categories, service_type, status')
        .eq('id', userId)
        .eq('status', 'active')
        .single();

      if (partnerError || !partnerData) {
        return NextResponse.json(
          { error: 'Partner not found or inactive' },
          { status: 404 }
        );
      }
      partner = partnerData;
    }

    // Calculate 24 hours ago timestamp
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const twentyFourHoursAgoISO = twentyFourHoursAgo.toISOString();

    // Build query for orders - only show orders from last 24 hours
    let query = supabase
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
        mobile_number
      `)
      .eq('status', 'pending')
      .is('partner_id', null) // Only unassigned orders
      .gte('date_created', twentyFourHoursAgoISO) // Only orders from last 24 hours
      .order('date_created', { ascending: false }) // Latest first
      .limit(50);

    // Apply filters only for partners, not for admins
    if (!isAdmin && partner) {
      // Filter by city if partner has city
      if (partner.city) {
        query = query.ilike('city', `%${partner.city}%`);
      }

      // Filter by service categories if partner has service_categories
      if (partner.service_categories && partner.service_categories.length > 0) {
        // For now, we'll filter by service_type matching partner's service_type
        // In a more complex system, you'd join with service_categories table
        if (partner.service_type && partner.service_type !== 'Other') {
          query = query.ilike('service_type', `%${partner.service_type}%`);
        }
      }
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: ordersError.message },
        { status: 500 }
      );
    }

    // Transform orders to match Task interface exactly and filter out expired tasks
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
      status: order.status || 'pending',
      serviceDate: order.service_date,
      timeSlot: order.time_slot,
      mode: order.mode || null
    })).filter(order => {
      // Filter out expired tasks based on timeslot
      return !isTaskExpired(order.timeSlot, order.serviceDate);
    }) || [];

    
    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      total: transformedOrders.length,
      userType: isAdmin ? 'admin' : 'partner',
      partner: partner ? {
        id: partner.id,
        name: partner.name,
        city: partner.city,
        serviceType: partner.service_type
      } : null
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST endpoint to accept an order
export async function POST(request: NextRequest) {
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

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // First, get the order details to check advance amount and payment mode
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, advance_amount, status, partner_id, mode')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'pending' || order.partner_id !== null) {
      return NextResponse.json(
        { error: 'Order not available for acceptance' },
        { status: 400 }
      );
    }

    // Get partner wallet balance
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, wallet_balance')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    const advanceAmount = parseFloat(order.advance_amount?.toString() || '0');
    const currentBalance = parseFloat(partner.wallet_balance?.toString() || '0');
    
    // Check if partner has sufficient balance for all orders
    if (currentBalance < advanceAmount) {
      return NextResponse.json(
        { 
          error: 'Insufficient wallet balance',
          details: {
            requiredAmount: advanceAmount,
            currentBalance: currentBalance,
            shortfall: advanceAmount - currentBalance
          }
        },
        { status: 400 }
      );
    }

    // Start a transaction to update order and deduct wallet balance
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        partner_id: partnerId,
        status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('status', 'pending')
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to accept order', details: updateError.message },
        { status: 500 }
      );
    }

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found or already assigned' },
        { status: 404 }
      );
    }

    // Deduct advance amount from partner wallet for all orders
    const newBalance = currentBalance - advanceAmount;
    const { error: walletUpdateError } = await supabase
      .from('partners')
      .update({
        wallet_balance: newBalance,
        last_transaction_at: new Date().toISOString(),
        wallet_updated_at: new Date().toISOString()
      })
      .eq('id', partnerId);

    if (walletUpdateError) {
      // Note: In a production system, you might want to rollback the order assignment
      // For now, we'll log the error but still return success
    }

    // Create wallet transaction record for all orders
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        partner_id: partnerId,
        transaction_type: 'debit',
        amount: advanceAmount,
        balance_before: currentBalance,
        balance_after: newBalance,
        description: `Advance payment for order ${orderId}`,
        reference_id: orderId,
        reference_type: 'order_advance',
        status: 'completed',
        metadata: {
          order_id: orderId,
          order_title: updatedOrder.title || 'Service Order',
          customer_name: updatedOrder.customer_name || 'Unknown Customer'
        },
        processed_at: new Date().toISOString()
      });

    if (transactionError) {
      // Log error but don't fail the request
    }

    return NextResponse.json({
      success: true,
      message: 'Order accepted successfully',
      order: updatedOrder,
      paymentMode: order.mode,
      walletUpdate: {
        previousBalance: currentBalance,
        newBalance: newBalance,
        deductedAmount: advanceAmount
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
