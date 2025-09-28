// Razorpay Order Creation API (Next.js 15+ App Router)
import { NextResponse, NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import { verifyPartnerToken } from '@/lib/auth';

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
    
    console.log('🔄 Razorpay order creation request:', body);

    // Validate required fields
    const { amount, customerInfo } = body;

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount', message: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Generate unique receipt ID
    const receiptId = `RCPT_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.abs(parseFloat(amount)) * 100, // Convert to paise
      currency: 'INR',
      receipt: receiptId,
      notes: {
        partner_id: partnerId?.toString() || 'unknown',
        customer_name: customerInfo?.customerName || 'Partner',
        customer_email: customerInfo?.customerEmailId || 'partner@example.com',
        customer_contact: customerInfo?.customerMobileNo || '9999999999',
      },
    });

    console.log('✅ Razorpay order created:', order.id);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      key_id: process.env.RAZORPAY_KEY_ID,
      message: 'Order created successfully',
    });

  } catch (error) {
    console.error('❌ Razorpay order creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}