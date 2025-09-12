// Payment Refund API Route
import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';
import { createRefundRequest } from '@/utils/paymentUtils';
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
    const { txnReferenceId, refundAmount, refundType } = body;

    if (!txnReferenceId || !refundAmount) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'Transaction reference ID and refund amount are required' },
        { status: 400 }
      );
    }

    if (refundAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid refund amount', message: 'Refund amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Create refund request
    const refundRequest = createRefundRequest({
      txnReferenceId,
      refundAmount,
      refundType: refundType || 'OFFLINE'
    });

    // Process refund
    const result = await paymentService.processRefund(refundRequest);

    if (result.statusCode === 'SPG-0000') {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Refund processed successfully'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.statusCode,
          message: result.statusMessage 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Refund API error:', error);
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
