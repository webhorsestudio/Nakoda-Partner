// Razorpay Webhook Handler for Production
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { SecurityUtils } from '@/utils/securityUtils';
import { environmentConfig } from '@/config/environment';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Webhook event types
interface RazorpayWebhookEvent {
  event: string;
  account_id: string;
  created_at: number;
  contains: string[];
  payload: {
    payment: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        method: string;
        description: string;
        vpa?: string;
        email: string;
        contact: string;
        notes: Record<string, string>;
        created_at: number;
      };
    };
    order: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        receipt: string;
        status: string;
        created_at: number;
        notes: Record<string, string>;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Security logging
    SecurityUtils.logSecurityEvent('WEBHOOK_RECEIVED', {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    }, 'low');

    // Get webhook signature
    const razorpaySignature = request.headers.get('x-razorpay-signature');
    if (!razorpaySignature) {
      SecurityUtils.logSecurityEvent('WEBHOOK_NO_SIGNATURE', {}, 'high');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Get raw body for signature verification
    const body = await request.text();
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', environmentConfig.razorpay.webhookSecret)
      .update(body)
      .digest('hex');

    if (!crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpaySignature, 'hex')
    )) {
      SecurityUtils.logSecurityEvent('WEBHOOK_INVALID_SIGNATURE', {
        receivedSignature: razorpaySignature.substring(0, 10) + '...',
        expectedSignature: expectedSignature.substring(0, 10) + '...'
      }, 'high');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Parse webhook payload
    const webhookEvent: RazorpayWebhookEvent = JSON.parse(body);
    
    console.log('✅ Webhook signature verified, processing event:', webhookEvent.event);

    // Process different webhook events
    switch (webhookEvent.event) {
      case 'payment.captured':
        await handlePaymentCaptured(webhookEvent);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(webhookEvent);
        break;
        
      case 'order.paid':
        await handleOrderPaid(webhookEvent);
        break;
        
      case 'refund.created':
        await handleRefundCreated(webhookEvent);
        break;
        
      case 'refund.processed':
        await handleRefundProcessed(webhookEvent);
        break;
        
      default:
        console.log(`ℹ️ Unhandled webhook event: ${webhookEvent.event}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    SecurityUtils.logSecurityEvent('WEBHOOK_PROCESSING_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'high');
    
    return NextResponse.json({ 
      error: 'Webhook processing failed' 
    }, { status: 500 });
  }
}

// Handle successful payment capture
async function handlePaymentCaptured(event: RazorpayWebhookEvent) {
  const payment = event.payload.payment.entity;
  const order = event.payload.order.entity;
  
  console.log('💰 Payment captured:', payment.id);
  
  try {
    // Get partner ID from order notes
    const partnerId = order.notes.partner_id;
    if (!partnerId) {
      throw new Error('Partner ID not found in order notes');
    }

    // Check if this payment was already processed
    const { data: existingTransaction } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('reference_id', payment.id)
      .eq('reference_type', 'razorpay_payment')
      .single();

    if (existingTransaction) {
      console.log('ℹ️ Payment already processed:', payment.id);
      return;
    }

    // Get current wallet balance
    const { data: partner, error: fetchError } = await supabase
      .from('partners')
      .select('wallet_balance')
      .eq('id', partnerId)
      .single();

    if (fetchError || !partner) {
      throw new Error(`Failed to fetch partner wallet: ${fetchError?.message}`);
    }

    const currentBalance = partner.wallet_balance || 0;
    const amountInRupees = payment.amount / 100; // Convert from paise
    const newBalance = currentBalance + amountInRupees;

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
      throw new Error(`Failed to update wallet: ${updateError.message}`);
    }

    // Log transaction
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        partner_id: partnerId,
        transaction_type: 'credit',
        amount: amountInRupees,
        balance_before: currentBalance,
        balance_after: newBalance,
        description: 'Wallet top-up via Razorpay (Webhook)',
        reference_id: payment.id,
        reference_type: 'razorpay_payment',
        status: 'completed',
        metadata: {
          payment_method: payment.method,
          order_id: order.id,
          webhook_event: event.event,
          processed_at: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('❌ Failed to log transaction:', transactionError.message);
    }

    console.log('✅ Wallet updated via webhook:', {
      partnerId,
      amount: amountInRupees,
      oldBalance: currentBalance,
      newBalance: newBalance
    });

  } catch (error) {
    console.error('❌ Error processing payment captured webhook:', error);
    SecurityUtils.logSecurityEvent('WEBHOOK_PAYMENT_CAPTURED_ERROR', {
      paymentId: payment.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'high');
  }
}

// Handle failed payment
async function handlePaymentFailed(event: RazorpayWebhookEvent) {
  const payment = event.payload.payment.entity;
  
  console.log('❌ Payment failed:', payment.id);
  
  try {
    // Log failed payment for monitoring
    const { error } = await supabase
      .from('wallet_transactions')
      .insert({
        partner_id: null, // Will be filled if we can determine it
        transaction_type: 'debit',
        amount: 0,
        balance_before: 0,
        balance_after: 0,
        description: `Payment failed: ${payment.description || 'Unknown reason'}`,
        reference_id: payment.id,
        reference_type: 'razorpay_payment_failed',
        status: 'failed',
        metadata: {
          payment_method: payment.method,
          failure_reason: payment.description,
          webhook_event: event.event,
          processed_at: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Failed to log failed payment:', error.message);
    }

    SecurityUtils.logSecurityEvent('PAYMENT_FAILED', {
      paymentId: payment.id,
      amount: payment.amount,
      method: payment.method
    }, 'medium');

  } catch (error) {
    console.error('❌ Error processing payment failed webhook:', error);
  }
}

// Handle order paid
async function handleOrderPaid(event: RazorpayWebhookEvent) {
  const order = event.payload.order.entity;
  
  console.log('✅ Order paid:', order.id);
  
  // This is typically handled by payment.captured, but we log it for completeness
  SecurityUtils.logSecurityEvent('ORDER_PAID', {
    orderId: order.id,
    amount: order.amount
  }, 'low');
}

// Handle refund created
async function handleRefundCreated(event: RazorpayWebhookEvent) {
  console.log('🔄 Refund created:', event.payload);
  
  SecurityUtils.logSecurityEvent('REFUND_CREATED', {
    refundId: 'unknown' // Refund ID not available in current payload structure
  }, 'medium');
}

// Handle refund processed
async function handleRefundProcessed(event: RazorpayWebhookEvent) {
  console.log('✅ Refund processed:', event.payload);
  
  SecurityUtils.logSecurityEvent('REFUND_PROCESSED', {
    refundId: 'unknown' // Refund ID not available in current payload structure
  }, 'medium');
}

// GET endpoint for webhook verification (if needed)
export async function GET() {
  return NextResponse.json({ 
    message: 'Razorpay webhook endpoint is active',
    timestamp: new Date().toISOString(),
    environment: environmentConfig.razorpay.environment
  });
}
