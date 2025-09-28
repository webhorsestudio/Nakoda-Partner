// Razorpay Payment Verification API (Next.js 15+ App Router)
import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
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
    
    console.log('🔄 Razorpay payment verification request:', body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, partnerId: requestPartnerId, amount } = body;

    // Use partnerId from request if provided, otherwise use authenticated user
    const finalPartnerId = requestPartnerId || partnerId;

    // Verify payment signature
    const body_signature = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body_signature.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.error('❌ Invalid payment signature');
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    console.log('✅ Payment signature verified');

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    console.log('✅ Payment details fetched:', payment.id);

    // Update partner wallet balance directly
    const amountInRupees = amount || (Number(payment.amount) / 100); // Convert from paise to rupees
    console.log('💰 Updating wallet for partner:', finalPartnerId, 'amount:', amountInRupees);
    
    // Get current balance
    const { data: currentPartner, error: fetchError } = await supabase
      .from('partners')
      .select('wallet_balance')
      .eq('id', finalPartnerId)
      .single();

    if (fetchError || !currentPartner) {
      console.error('❌ Failed to fetch current wallet balance:', fetchError?.message);
      return NextResponse.json(
        { error: 'Failed to fetch current wallet balance', details: fetchError?.message },
        { status: 500 }
      );
    }

    const currentBalance = currentPartner.wallet_balance || 0;
    const newBalance = currentBalance + amountInRupees;

    // Update partner wallet balance
    const { data: updatedPartner, error: updateError } = await supabase
      .from('partners')
      .update({ 
        wallet_balance: newBalance,
        last_transaction_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', finalPartnerId)
      .select()
      .single();

    if (updateError || !updatedPartner) {
      console.error('❌ Failed to update wallet balance:', updateError?.message);
      return NextResponse.json(
        { error: 'Failed to update wallet balance', details: updateError?.message },
        { status: 500 }
      );
    }

    // Insert wallet transaction record (if table exists)
    let transaction = null;
    try {
      const { data: transactionData, error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          partner_id: finalPartnerId,
          transaction_type: 'credit',
          amount: amountInRupees,
          balance_before: currentBalance,
          balance_after: newBalance,
          description: 'Wallet top-up via Razorpay',
          reference_id: razorpay_payment_id,
          reference_type: 'razorpay_payment',
          status: 'completed',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (transactionError) {
        console.error('❌ Failed to log transaction (table may not exist):', transactionError.message);
        console.log('ℹ️ Transaction logging failed, but wallet was updated successfully');
      } else {
        transaction = transactionData;
        console.log('✅ Transaction logged successfully:', transaction.id);
      }
    } catch (transactionErr) {
      console.error('❌ Transaction logging error:', transactionErr);
      console.log('ℹ️ Transaction logging failed, but wallet was updated successfully');
    }

    console.log('✅ Wallet updated successfully:', {
      partnerId: finalPartnerId,
      oldBalance: currentBalance,
      newBalance: newBalance,
      amount: amountInRupees,
      transactionId: transaction?.id
    });

    return NextResponse.json({
      success: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      amount: amountInRupees,
      status: payment.status,
      message: 'Payment verified and wallet updated successfully',
      wallet_update: {
        oldBalance: currentBalance,
        newBalance: newBalance,
        transactionId: transaction?.id
      },
    });

  } catch (error) {
    console.error('❌ Razorpay payment verification error:', error);
    
    // Ensure we always return JSON, never HTML
    try {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment verification failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error instanceof Error ? error.stack : 'No stack trace available'
        },
        { status: 500 }
      );
    } catch (jsonError) {
      // If JSON serialization fails, return a simple text response
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment verification failed',
          message: 'Internal server error'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }
}
