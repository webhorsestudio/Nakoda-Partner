// Razorpay Payment Status Verification API for WebView Integration
// This endpoint actively checks Razorpay API and updates wallet if payment succeeded
import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ 
        error: 'Missing parameters',
        message: 'order_id is required'
      }, { status: 400 });
    }

    console.log(`🔍 Verifying payment status for partner ${partnerId}, order ${orderId}`);

    // Step 1: Check if payment was already processed in our database
    const { data: existingTransaction } = await supabase
      .from('wallet_transactions')
      .select('id, transaction_type, amount, status, balance_after, created_at, metadata')
      .eq('reference_id', orderId)
      .eq('partner_id', partnerId)
      .eq('reference_type', 'razorpay_order')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingTransaction && existingTransaction.status === 'completed') {
      console.log(`✅ Payment already processed: ${orderId}`);
      
      // Get current wallet balance
      const { data: partner } = await supabase
        .from('partners')
        .select('wallet_balance')
        .eq('id', partnerId)
        .single();

      return NextResponse.json({
        success: true,
        payment_status: 'captured',
        wallet_balance: partner?.wallet_balance || 0,
        amount_added: existingTransaction.amount,
        transaction_id: existingTransaction.id,
        already_processed: true,
        message: 'Payment already processed'
      });
    }

    // Step 2: Check with Razorpay API to see actual payment status
    let razorpayOrder;
    let razorpayPayments;
    
    try {
      razorpayOrder = await razorpay.orders.fetch(orderId);
      console.log(`📦 Razorpay order status: ${razorpayOrder.status}`);
      
      razorpayPayments = await razorpay.orders.fetchPayments(orderId);
      console.log(`💰 Found ${razorpayPayments.count} payments for order ${orderId}`);
    } catch (razorpayError) {
      const error = razorpayError as Error;
      console.error('❌ Failed to fetch order from Razorpay:', error);
      return NextResponse.json({
        success: false,
        payment_status: 'error',
        message: `Failed to fetch order from Razorpay: ${error.message || 'Unknown error'}`,
        order_id: orderId
      }, { status: 500 });
    }

    // Step 3: Check if any payment is captured
    const capturedPayment = razorpayPayments.items.find((p) => p.status === 'captured');

    if (!capturedPayment) {
      console.log(`⏳ No captured payment found for order ${orderId}`);
      const orderAmount = typeof razorpayOrder.amount === 'number' 
        ? razorpayOrder.amount / 100 
        : parseFloat(razorpayOrder.amount.toString()) / 100;
      
      return NextResponse.json({
        success: false,
        payment_status: razorpayOrder.status,
        message: `Payment not completed yet. Order status: ${razorpayOrder.status}`,
        order_id: orderId,
        order_amount: orderAmount
      });
    }

    // Step 4: Payment is captured - check if we already processed it by payment_id
    const { data: paymentProcessed } = await supabase
      .from('wallet_transactions')
      .select('id, status, amount, balance_after')
      .eq('reference_id', capturedPayment.id)
      .eq('reference_type', 'razorpay_payment')
      .eq('partner_id', partnerId)
      .single();

    if (paymentProcessed && paymentProcessed.status === 'completed') {
      console.log(`✅ Payment ${capturedPayment.id} already processed`);
      
      const { data: partner } = await supabase
        .from('partners')
        .select('wallet_balance')
        .eq('id', partnerId)
        .single();

      return NextResponse.json({
        success: true,
        payment_status: 'captured',
        payment_id: capturedPayment.id,
        wallet_balance: partner?.wallet_balance || 0,
        amount_added: paymentProcessed.amount,
        transaction_id: paymentProcessed.id,
        already_processed: true,
        message: 'Payment already processed'
      });
    }

    // Step 5: Payment is captured but not processed - UPDATE WALLET NOW
    console.log(`💰 Payment captured but not processed - updating wallet for partner ${partnerId}`);
    
    // Get partner info and order notes for partner_id verification
    const partnerIdFromOrder = razorpayOrder.notes?.partner_id;
    const partnerIdFromOrderNum = partnerIdFromOrder 
      ? parseInt(partnerIdFromOrder.toString(), 10) 
      : null;
    if (partnerIdFromOrderNum && partnerIdFromOrderNum !== partnerId) {
      console.error(`❌ Partner ID mismatch: Order has ${partnerIdFromOrder}, authenticated user is ${partnerId}`);
      return NextResponse.json({
        success: false,
        payment_status: 'captured',
        error: 'Partner ID mismatch',
        message: 'This payment belongs to a different partner'
      }, { status: 403 });
    }

    // Get current wallet balance
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('wallet_balance')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      console.error('❌ Failed to fetch partner:', partnerError);
      return NextResponse.json({
        success: false,
        error: 'Partner not found',
        message: 'Unable to fetch partner wallet'
      }, { status: 404 });
    }

    const currentBalance = parseFloat(partner.wallet_balance?.toString() || '0');
    const paymentAmount = typeof capturedPayment.amount === 'number' 
      ? capturedPayment.amount 
      : parseFloat(capturedPayment.amount.toString());
    const amountInRupees = paymentAmount / 100; // Convert from paise
    const newBalance = currentBalance + amountInRupees;

    console.log(`💰 Updating wallet: Partner ${partnerId}, Amount: ₹${amountInRupees}, Balance: ₹${currentBalance} → ₹${newBalance}`);

    // Create transaction record FIRST (so we have record even if balance update fails)
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        partner_id: partnerId,
        transaction_type: 'credit',
        amount: amountInRupees,
        balance_before: currentBalance,
        balance_after: newBalance,
        description: 'Wallet top-up via Razorpay (Status Verification)',
        reference_id: capturedPayment.id,
        reference_type: 'razorpay_payment',
        status: 'completed',
        metadata: {
          order_id: orderId,
          payment_method: capturedPayment.method,
          verification_method: 'status_api',
          webview_integration: true,
          processed_at: new Date().toISOString(),
          razorpay_order_status: razorpayOrder.status
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (transactionError) {
      console.error('❌ Failed to create transaction record:', transactionError);
      return NextResponse.json({
        success: false,
        error: 'Transaction creation failed',
        message: transactionError.message
      }, { status: 500 });
    }

    // Update wallet balance
    const { error: updateError } = await supabase
      .from('partners')
      .update({ 
        wallet_balance: newBalance,
        last_transaction_at: new Date().toISOString(),
        wallet_updated_at: new Date().toISOString()
      })
      .eq('id', partnerId);

    if (updateError) {
      console.error('❌ Failed to update wallet balance:', updateError);
      // Transaction was created but wallet wasn't updated - this is bad
      // Mark transaction as failed
      await supabase
        .from('wallet_transactions')
        .update({ status: 'failed', metadata: { ...transaction.metadata, wallet_update_error: updateError.message } })
        .eq('id', transaction.id);

      return NextResponse.json({
        success: false,
        error: 'Wallet update failed',
        message: updateError.message
      }, { status: 500 });
    }

    console.log(`✅ Payment verified and wallet updated: Order ${orderId}, Payment ${capturedPayment.id}, Amount ₹${amountInRupees}`);

    return NextResponse.json({
      success: true,
      payment_status: 'captured',
      payment_id: capturedPayment.id,
      order_id: orderId,
      wallet_balance: newBalance,
      amount_added: amountInRupees,
      balance_before: currentBalance,
      balance_after: newBalance,
      transaction_id: transaction.id,
      message: 'Payment verified and wallet updated successfully'
    });

  } catch (error) {
    console.error('❌ Payment status verification error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
