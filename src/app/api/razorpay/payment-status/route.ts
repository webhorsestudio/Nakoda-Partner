// Razorpay Payment Status API for WebView Integration
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPartnerToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');
    const orderId = searchParams.get('order_id');

    if (!paymentId || !orderId) {
      return NextResponse.json({ 
        error: 'Missing parameters',
        message: 'payment_id and order_id are required'
      }, { status: 400 });
    }

    console.log(`🔍 Checking payment status for partner ${partnerId}, payment ${paymentId}`);

    // Check if payment was already processed
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .select(`
        id,
        transaction_type,
        amount,
        status,
        balance_after,
        description,
        processed_at,
        created_at,
        metadata
      `)
      .eq('reference_id', paymentId)
      .eq('reference_type', 'razorpay_payment')
      .eq('partner_id', partnerId)
      .single();

    if (transactionError && transactionError.code !== 'PGRST116') {
      console.error('Error checking payment status:', transactionError);
      return NextResponse.json({ 
        error: 'Database error',
        message: transactionError.message
      }, { status: 500 });
    }

    if (transaction) {
      console.log(`✅ Payment found: ${transaction.status}`);
      return NextResponse.json({
        success: true,
        status: transaction.status,
        amount: transaction.amount,
        balance_after: transaction.balance_after,
        processed_at: transaction.processed_at,
        transaction_id: transaction.id,
        message: `Payment ${transaction.status}`
      });
    }

    // Payment not found - check if it's still processing
    const { data: pendingTransaction } = await supabase
      .from('wallet_transactions')
      .select('id, status, created_at')
      .eq('reference_id', paymentId)
      .eq('reference_type', 'razorpay_order')
      .eq('partner_id', partnerId)
      .eq('status', 'pending')
      .single();

    if (pendingTransaction) {
      console.log(`⏳ Payment still processing: ${paymentId}`);
      return NextResponse.json({
        success: false,
        status: 'processing',
        message: 'Payment is still being processed',
        created_at: pendingTransaction.created_at
      });
    }

    // Payment not found at all
    console.log(`❌ Payment not found: ${paymentId}`);
    return NextResponse.json({
      success: false,
      status: 'not_found',
      message: 'Payment not found or not yet processed',
      payment_id: paymentId,
      order_id: orderId
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST endpoint for manual payment verification
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
    const body = await request.json();
    const { payment_id, order_id, amount } = body;

    if (!payment_id || !order_id || !amount) {
      return NextResponse.json({ 
        error: 'Missing parameters',
        message: 'payment_id, order_id, and amount are required'
      }, { status: 400 });
    }

    console.log(`🔄 Manual payment verification for partner ${partnerId}, payment ${payment_id}`);

    // Check if payment already exists
    const { data: existingTransaction } = await supabase
      .from('wallet_transactions')
      .select('id, status')
      .eq('reference_id', payment_id)
      .eq('reference_type', 'razorpay_payment')
      .eq('partner_id', partnerId)
      .single();

    if (existingTransaction) {
      return NextResponse.json({
        success: true,
        status: existingTransaction.status,
        message: 'Payment already processed',
        transaction_id: existingTransaction.id
      });
    }

    // Get current wallet balance
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('wallet_balance')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ 
        error: 'Partner not found',
        message: 'Unable to fetch partner wallet'
      }, { status: 404 });
    }

    const currentBalance = partner.wallet_balance || 0;
    const newBalance = currentBalance + parseFloat(amount);

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        partner_id: partnerId,
        transaction_type: 'credit',
        amount: parseFloat(amount),
        balance_before: currentBalance,
        balance_after: newBalance,
        description: 'Wallet top-up via Razorpay (WebView)',
        reference_id: payment_id,
        reference_type: 'razorpay_payment',
        status: 'completed',
        metadata: {
          order_id: order_id,
          verification_method: 'manual',
          webview_integration: true,
          processed_at: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return NextResponse.json({ 
        error: 'Transaction creation failed',
        message: transactionError.message
      }, { status: 500 });
    }

    // Update partner wallet balance
    const { error: updateError } = await supabase
      .from('partners')
      .update({ 
        wallet_balance: newBalance,
        last_transaction_at: new Date().toISOString(),
        wallet_updated_at: new Date().toISOString()
      })
      .eq('id', partnerId);

    if (updateError) {
      console.error('Error updating wallet balance:', updateError);
      return NextResponse.json({ 
        error: 'Wallet update failed',
        message: updateError.message
      }, { status: 500 });
    }

    console.log(`✅ Manual payment verification successful: ${payment_id}`);

    return NextResponse.json({
      success: true,
      status: 'completed',
      amount: parseFloat(amount),
      balance_before: currentBalance,
      balance_after: newBalance,
      transaction_id: transaction.id,
      message: 'Payment verified and wallet updated successfully'
    });

  } catch (error) {
    console.error('Manual payment verification error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
