import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/auth';
import { acefoneService } from '@/services/acefoneService';
import { CALL_TYPES } from '@/config/acefone';

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
    
    const { customerPhone, orderId } = body;

    // Validate required fields
    if (!customerPhone) {
      return NextResponse.json(
        { error: 'Customer phone number is required' },
        { status: 400 }
      );
    }

    // Get partner's phone number from database
    const { supabase } = await import('@/lib/supabase');
    const { data: partnerData, error: partnerError } = await supabase
      .from('partners')
      .select('mobile')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partnerData) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    const partnerPhone = partnerData.mobile;

    // Initiate masked call
    const callResult = await acefoneService.initiateMaskedCall({
      partnerPhone,
      customerPhone,
      callType: CALL_TYPES.PARTNER_TO_CUSTOMER,
      orderId,
      partnerId,
      customerId: orderId // Assuming orderId can be used as customerId
    });

    if (callResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Call initiated successfully',
        data: {
          callId: callResult.callId,
          virtualNumber: callResult.virtualNumber,
          status: callResult.status
        }
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: callResult.error || 'Failed to initiate call',
          message: callResult.message 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error initiating masked call:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
