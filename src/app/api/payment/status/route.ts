// Payment Status API Route
import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';
import { createTransactionStatusRequest } from '@/utils/paymentUtils';
import { verifyPartnerToken } from '@/lib/auth';

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

    const body = await request.json();
    const { merchantTxnId, txnReferenceId } = body;

    if (!merchantTxnId) {
      return NextResponse.json(
        { error: 'Missing merchantTxnId', message: 'Merchant transaction ID is required' },
        { status: 400 }
      );
    }

    // Create transaction status request
    const statusRequest = createTransactionStatusRequest(merchantTxnId, txnReferenceId);

    // Check transaction status
    const result = await paymentService.checkTransactionStatus(statusRequest);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Transaction status retrieved successfully'
    });

  } catch (error) {
    console.error('Status API error:', error);
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
