// Test Payment API Route (without authentication)
import { NextRequest, NextResponse } from 'next/server';
import { getPaymentConfig } from '@/config/payment';

export async function GET(request: NextRequest) {
  try {
    console.log('=== PAYMENT TEST API ===');
    
    // Test configuration loading
    const config = getPaymentConfig();
    console.log('Config loaded:', {
      baseUrl: config.baseUrl,
      merchantId: config.merchantId,
      clientId: config.clientId,
      merchantKey: config.merchantKey ? 'SET' : 'NOT SET'
    });

    // Test environment variables
    console.log('Environment variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('AXIS_PG_SANDBOX_URL:', process.env.AXIS_PG_SANDBOX_URL);
    console.log('AXIS_PG_SANDBOX_MERCHANT_ID:', process.env.AXIS_PG_SANDBOX_MERCHANT_ID);
    console.log('AXIS_PG_SANDBOX_MERCHANT_KEY:', process.env.AXIS_PG_SANDBOX_MERCHANT_KEY ? 'SET' : 'NOT SET');

    return NextResponse.json({
      success: true,
      message: 'Payment test API working',
      config: {
        baseUrl: config.baseUrl,
        merchantId: config.merchantId,
        clientId: config.clientId,
        merchantKeySet: !!config.merchantKey
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        sandboxUrl: process.env.AXIS_PG_SANDBOX_URL,
        sandboxMerchantId: process.env.AXIS_PG_SANDBOX_MERCHANT_ID,
        sandboxMerchantKey: process.env.AXIS_PG_SANDBOX_MERCHANT_KEY ? 'SET' : 'NOT SET'
      }
    });

  } catch (error) {
    console.error('Payment test API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'TEST_API_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
