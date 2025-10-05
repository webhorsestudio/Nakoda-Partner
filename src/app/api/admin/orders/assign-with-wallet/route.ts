import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface AssignOrderRequest {
  orderNumber: string;
  partnerId: number;
  advanceAmount: number;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const { orderNumber, partnerId, advanceAmount }: AssignOrderRequest = await request.json();

    // Validate input
    if (!orderNumber || !partnerId || !advanceAmount) {
      return NextResponse.json(
        { error: 'Order number, partner ID, and advance amount are required' },
        { status: 400 }
      );
    }

    if (advanceAmount <= 0) {
      return NextResponse.json(
        { error: 'Advance amount must be greater than zero' },
        { status: 400 }
      );
    }

    console.log(`💰 Admin assigning order ${orderNumber} to partner ${partnerId} with advance ₹${advanceAmount}`);

    // Check if partner exists and has sufficient wallet balance
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, name, mobile, wallet_balance, wallet_status, status')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Check partner status
    if (partner.status !== 'active') {
      return NextResponse.json(
        { error: 'Partner is not active' },
        { status: 400 }
      );
    }

    if (partner.wallet_status !== 'active') {
      return NextResponse.json(
        { error: 'Partner wallet is not active' },
        { status: 400 }
      );
    }

    const currentBalance = parseFloat(partner.wallet_balance?.toString() || '0');
    const requiredAmount = parseFloat(advanceAmount.toString());

    // Check if partner has sufficient balance
    if (currentBalance < requiredAmount) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient wallet balance',
        walletInfo: {
          currentBalance,
          requiredAmount,
          shortfall: requiredAmount - currentBalance,
          partnerId: partner.id,
          partnerName: partner.name
        }
      }, { status: 400 });
    }

    // Proceed with wallet deduction and order assignment
    const newBalance = currentBalance - requiredAmount;

    // Update partner wallet balance and last transaction time
    const { error: walletUpdateError } = await supabase
      .from('partners')
      .update({ 
        wallet_balance: newBalance,
        last_transaction_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', partnerId);

    if (walletUpdateError) {
      console.error('Error updating partner wallet:', walletUpdateError);
      return NextResponse.json(
        { error: 'Failed to update partner wallet balance' },
        { status: 500 }
      );
    }

    // Assign order to partner by updating the order record
    const { data: order, error: orderUpdateError } = await supabase
      .from('orders')
      .update({ 
        partner_id: partnerId,
        status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('order_number', orderNumber)
      .select('id, order_number, title')
      .single();

    if (orderUpdateError || !order) {
      console.error('Error assigning order:', orderUpdateError);
      
      // Rollback wallet update
      await supabase
        .from('partners')
        .update({ 
          wallet_balance: currentBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', partnerId);

      return NextResponse.json(
        { error: 'Failed to assign order to partner' },
        { status: 500 }
      );
    }

    // Create wallet transaction record
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        partner_id: partnerId,
        transaction_type: 'debit',
        amount: requiredAmount,
        balance_before: currentBalance,
        balance_after: newBalance,
        description: `Admin assignment: Advance payment for order ${orderNumber}`,
        reference_id: order.id,
        reference_type: 'admin_order_assignment',
        status: 'completed',
        metadata: {
          order_number: orderNumber,
          order_title: order.title || 'Service Order',
          assigned_by_admin: true,
          admin_user_id: authResult.userId
        },
        processed_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('Error creating wallet transaction:', transactionError);
      // Don't fail the request since order is already assigned
    }

    console.log(`✅ Order ${orderNumber} successfully assigned to partner ${partner.name} (ID: ${partnerId})`);

    return NextResponse.json({
      success: true,
      message: 'Order assigned successfully',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        title: order.title
      },
      partner: {
        id: partner.id,
        name: partner.name,
        mobile: partner.mobile
      },
      walletUpdate: {
        previousBalance: currentBalance,
        newBalance: newBalance,
        deductedAmount: requiredAmount
      }
    });

  } catch (error) {
    console.error('Admin order assignment error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
