import { NextRequest, NextResponse } from 'next/server';
import { ACEFONE_CONFIG, formatPhoneForAcefone } from '@/config/acefone';
import { supabase } from '@/lib/supabase';
import { verifyPartnerToken } from '@/lib/auth';

interface ClickToCallRequest {
  taskId: string;
  customerPhone: string;
}

interface ClickToCallResponse {
  success: boolean;
  callId?: string;
  message: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📞 Click-to-Call API Request Received');
    
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
    const body: ClickToCallRequest = await request.json();
    const { taskId, customerPhone } = body;
    
    console.log('📋 Click-to-Call Request:', {
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

    // Format phone numbers for Acefone API
    const agentNumber = formatPhoneForAcefone(partner.mobile);
    const destinationNumber = formatPhoneForAcefone(customerPhone);
    
    console.log('📞 Formatted phone numbers:', {
      agentNumber,
      destinationNumber,
      originalAgent: partner.mobile,
      originalCustomer: customerPhone
    });

    // Prepare Click-to-Call API request
    const clickToCallPayload = {
      agent_number: agentNumber,
      destination_number: destinationNumber,
      caller_id: ACEFONE_CONFIG.DID_NUMBER, // Use DID as caller ID for masking
      async: "1", // Asynchronous request
      call_timeout: ACEFONE_CONFIG.CALL_TIMEOUT,
      custom_identifier: `task_${taskId}_partner_${partnerId}`
    };

    console.log('📞 Click-to-Call API Payload:', clickToCallPayload);

    // Call Acefone Click-to-Call API
    const acefoneResponse = await fetch(
      `${ACEFONE_CONFIG.API_BASE_URL}${ACEFONE_CONFIG.CLICK_TO_CALL_ENDPOINT}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACEFONE_CONFIG.API_TOKEN}`
        },
        body: JSON.stringify(clickToCallPayload)
      }
    );

    const acefoneResult = await acefoneResponse.json();
    console.log('📞 Acefone Click-to-Call Response:', acefoneResult);

    if (!acefoneResponse.ok) {
      console.error('❌ Acefone API Error:', acefoneResult);
      return NextResponse.json({
        success: false,
        error: `Acefone API error: ${acefoneResult.message || 'Unknown error'}`,
        details: acefoneResult
      }, { status: acefoneResponse.status });
    }

    // Log the call initiation in our database
    const { data: callLog, error: callLogError } = await supabase
      .from('call_logs')
      .insert({
        call_id: acefoneResult.call_id || `click_to_call_${Date.now()}`,
        uuid: acefoneResult.uuid || `uuid_${Date.now()}`,
        caller_number: agentNumber,
        called_number: destinationNumber,
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
          click_to_call: true,
          acefone_response: acefoneResult
        }
      })
      .select()
      .single();

    if (callLogError) {
      console.error('❌ Error logging call:', callLogError);
      // Don't fail the request if logging fails
    } else {
      console.log('✅ Call logged successfully:', callLog);
    }

    // Return success response
    const response: ClickToCallResponse = {
      success: true,
      callId: acefoneResult.call_id,
      message: `Call initiated successfully. Acefone will call ${partner.name} first, then connect to customer.`
    };

    console.log('✅ Click-to-Call successful:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in Click-to-Call API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
