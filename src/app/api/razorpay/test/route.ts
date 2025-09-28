// Razorpay Test API (Next.js 15+ App Router)
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET() {
  try {
    console.log('🧪 Testing Razorpay connection...');
    
    // Test 1: Check if credentials are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'Razorpay credentials not configured',
        config: {
          hasKeyId: !!process.env.RAZORPAY_KEY_ID,
          hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
        }
      }, { status: 500 });
    }

    // Test 2: Try to create a test order
    const testOrder = await razorpay.orders.create({
      amount: 100, // 1 rupee in paise
      currency: 'INR',
      receipt: `TEST_${Date.now()}`,
      notes: {
        test: 'true',
        purpose: 'connection_test'
      },
    });

    console.log('✅ Razorpay test order created:', testOrder.id);

    return NextResponse.json({
      success: true,
      message: 'Razorpay connection successful',
      test_order: {
        id: testOrder.id,
        amount: testOrder.amount,
        currency: testOrder.currency,
        status: testOrder.status,
      },
      config: {
        key_id: process.env.RAZORPAY_KEY_ID?.substring(0, 10) + '...',
        environment: process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_') ? 'sandbox' : 'production',
      }
    });

  } catch (error) {
    console.error('❌ Razorpay test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Razorpay connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      config: {
        hasKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
      }
    }, { status: 500 });
  }
}
