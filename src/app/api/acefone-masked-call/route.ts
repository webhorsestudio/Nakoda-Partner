import { NextRequest, NextResponse } from 'next/server';
import { ACEFONE_CONFIG, formatPhoneForAcefone } from '@/config/acefone';
import { supabase } from '@/lib/supabase';
import { verifyPartnerToken } from '@/lib/auth';

interface MaskedCallRequest {
  taskId: string;
  customerPhone: string;
}

interface MaskedCallResponse {
  success: boolean;
  callId?: string;
  message: string;
  error?: string;
  didNumber?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📞 Masked Call API Request Received');
    
    // Verify partner authentication
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const partnerId = authResult.userId;
    
    // Parse request body
    const body: MaskedCallRequest = await request.json();
    const { taskId, customerPhone } = body;
    
    console.log('📋 Masked Call Request:', {
      partnerId,
      taskId,
      customerPhone
    });

    // Validate required fields
    if (!taskId || !customerPhone) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: taskId and customerPhone'
      }, { status: 400 });
    }

    // Get partner information
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, name, mobile, status')
      .eq('id', partnerId)
      .eq('status', 'active')
      .single();

    if (partnerError || !partner) {
      console.error('❌ Partner not found:', partnerError);
      return NextResponse.json({
        success: false,
        error: 'Partner not found or inactive'
      }, { status: 404 });
    }

    // Get order information
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, mobile_number, status')
      .eq('id', taskId)
      .eq('partner_id', partnerId)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found:', orderError);
      return NextResponse.json({
        success: false,
        error: 'Order not found or not assigned to partner'
      }, { status: 404 });
    }

    // Format phone numbers
    const formattedCustomerPhone = formatPhoneForAcefone(customerPhone);
    const formattedPartnerPhone = formatPhoneForAcefone(partner.mobile);
    
    console.log('📞 Formatted phone numbers:', {
      partnerPhone: formattedPartnerPhone,
      customerPhone: formattedCustomerPhone,
      originalPartner: partner.mobile,
      originalCustomer: customerPhone
    });

    // Generate unique call ID
    const callId = `masked_call_${Date.now()}_${partnerId}`;
    const uuid = `uuid_${Date.now()}_${partnerId}`;

    // Log the call initiation in our database
    const { data: callLog, error: callLogError } = await supabase
      .from('call_logs')
      .insert({
        call_id: callId,
        uuid: uuid,
        caller_number: formattedPartnerPhone,
        called_number: formattedCustomerPhone,
        partner_id: partnerId,
        partner_phone: partner.mobile,
        customer_phone: customerPhone,
        order_id: taskId,
        call_type: 'partner_to_customer',
        status: 'initiated',
        virtual_number: ACEFONE_CONFIG.DID_NUMBER,
        metadata: {
          partner_name: partner.name,
          order_number: order.order_number,
          customer_name: order.customer_name,
          masked_call: true,
          call_method: 'did_bridge'
        }
      })
      .select()
      .single();

    if (callLogError) {
      console.error('❌ Error logging call:', callLogError);
      return NextResponse.json({
        success: false,
        error: 'Failed to log call in database',
        details: callLogError
      }, { status: 500 });
    }

    console.log('✅ Call logged successfully:', callLog);

    // Return success response with DID number for partner to call
    const response: MaskedCallResponse = {
      success: true,
      callId: callId,
      didNumber: ACEFONE_CONFIG.DID_NUMBER,
      message: `Call logged successfully. Please call ${ACEFONE_CONFIG.DID_NUMBER} to connect to customer ${order.customer_name}. The system will automatically route your call to the customer while keeping both numbers masked.`
    };

    console.log('✅ Masked Call successful:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in Masked Call API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
