// Payment Checkout API Route
import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';
import { createCheckoutRequest } from '@/utils/paymentUtils';
import { verifyPartnerToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Debug: Log environment variables (can be removed in production)
    console.log('=== PAYMENT CHECKOUT DEBUG ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('AXIS_PG_SANDBOX_URL:', process.env.AXIS_PG_SANDBOX_URL);
    console.log('AXIS_PG_SANDBOX_MERCHANT_ID:', process.env.AXIS_PG_SANDBOX_MERCHANT_ID);
    console.log('AXIS_PG_SANDBOX_MERCHANT_KEY:', process.env.AXIS_PG_SANDBOX_MERCHANT_KEY ? 'SET' : 'NOT SET');
    console.log('==============================');

    // Verify partner authentication
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      console.log('Authentication failed:', authResult.error);
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const partnerId = authResult.userId;
    const body = await request.json();
    
    console.log('Request body:', body);

    // Validate required fields
    const { amount, customerInfo, verifiedAccountInfo, subMerchantPayInfo } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount', message: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Fetch partner information from database
    let partnerInfo = null;
    try {
      const partnerResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/partners/${partnerId}`);
      if (partnerResponse.ok) {
        const partnerData = await partnerResponse.json();
        partnerInfo = partnerData.data;
      }
    } catch (error) {
      console.warn('Failed to fetch partner info:', error);
    }

    // Create checkout request with partner information
    const checkoutRequest = createCheckoutRequest({
      amount,
      customerInfo: {
        customerId: partnerId?.toString() || 'unknown',
        customerName: partnerInfo?.name || customerInfo?.customerName || 'Partner',
        customerEmailId: partnerInfo?.email || customerInfo?.customerEmailId || '',
        customerMobileNo: partnerInfo?.mobile || customerInfo?.customerMobileNo || '',
        customerStreetAddress: partnerInfo?.address || customerInfo?.customerStreetAddress || '',
        customerCity: partnerInfo?.city || customerInfo?.customerCity || '',
        customerState: partnerInfo?.state || customerInfo?.customerState || '',
        customerPIN: partnerInfo?.pin_code || customerInfo?.customerPIN || '',
        customerCountry: customerInfo?.customerCountry || 'India',
      },
      verifiedAccountInfo,
      subMerchantPayInfo,
      tags: `wallet_topup_partner_${partnerId}`,
      udf1: `partner_id:${partnerId}`,
      udf2: 'wallet_topup',
      udf3: new Date().toISOString(),
    });

    // Initiate checkout
    const result = await paymentService.initiateCheckout(checkoutRequest);

    if (result.success) {
      // If we have HTML data, create a redirect page that submits the form
      if (result.html) {
        const paymentUrl = `${process.env.AXIS_PG_SANDBOX_URL || 'https://sandbox-axispg.freecharge.in'}/payment/v1/checkout`;
        
        // Create a form and submit it to redirect to payment gateway
        const formData = new URLSearchParams();
        Object.entries(checkoutRequest).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, String(value));
          }
        });

        // Return a page that auto-submits the form
        const redirectPage = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Redirecting to Payment Gateway...</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                margin: 0;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
              }
              .container {
                background: rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                border: 1px solid rgba(255, 255, 255, 0.18);
              }
              .spinner { 
                border: 4px solid rgba(255, 255, 255, 0.3); 
                border-top: 4px solid #fff; 
                border-radius: 50%; 
                width: 50px; 
                height: 50px; 
                animation: spin 2s linear infinite; 
                margin: 20px auto; 
              }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              h2 { margin-bottom: 20px; font-size: 24px; }
              p { margin: 10px 0; font-size: 16px; opacity: 0.9; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Redirecting to Payment Gateway...</h2>
              <div class="spinner"></div>
              <p>Please wait while we redirect you to the secure payment gateway.</p>
              <p>You will be redirected back to our app after payment completion.</p>
            </div>
            <form id="paymentForm" action="${paymentUrl}" method="POST" style="display: none;">
              ${Array.from(formData.entries()).map(([key, value]) => 
                `<input type="hidden" name="${key}" value="${value}">`
              ).join('')}
            </form>
            <script>
              // Auto-submit the form after a short delay
              setTimeout(() => {
                document.getElementById('paymentForm').submit();
              }, 2000);
            </script>
          </body>
          </html>
        `;
        
        return new NextResponse(redirectPage, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          },
        });
      }

      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        redirectUrl: result.redirectUrl,
        status: 'PENDING',
        message: 'Payment initiated successfully'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error?.code || 'CHECKOUT_FAILED',
          message: result.error?.message || 'Failed to initiate payment'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'INTERNAL_ERROR',
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
