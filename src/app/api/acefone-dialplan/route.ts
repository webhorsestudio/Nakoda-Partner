import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ACEFONE_CONFIG, formatPhoneForAcefone, generatePhoneFormats } from '@/config/acefone';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types for Acefone webhook request (from API Dialplan)
interface AcefoneDialplanRequest {
  uuid: string;
  call_id: string;
  call_to_number: string; // This will be the DID number
  caller_id_number: string; // This will be the partner's actual number
  start_stamp: string;
  last_dtmf?: string; // If DTMF is used in the dialplan
}

// Types for Acefone response (transfer or recording)
interface AcefoneTransferResponse {
  transfer: {
    type: string;
    data: string[];
    ring_type?: string;
    skip_active?: boolean;
    moh?: string;
    disable_call_recording?: boolean;
  };
}

interface AcefoneRecordingResponse {
  recording: {
    type: string;
    data: string; // Recording ID
    dtmf?: {
      timeout: number;
      maxLength: number;
      retry: number;
    };
  };
}

type AcefoneResponse = AcefoneTransferResponse | AcefoneRecordingResponse;

// Helper function to log or update call details
async function logOrUpdateCall(request: AcefoneDialplanRequest, destinationInfo?: {
  partner_id?: number;
  partner_phone?: string;
  customer_phone?: string;
  order_id?: string;
  order_number?: string;
  customer_name?: string;
  partner_name?: string;
  error?: string;
}) {
  try {
    // Try to find an existing call log entry for this UUID (from masked call setup)
    const { data: existingCallLog, error: fetchError } = await supabase
      .from('call_logs')
      .select('*')
      .eq('uuid', request.uuid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('❌ Error fetching existing call log:', fetchError);
      // Continue to insert if not found or other error
    }

    if (existingCallLog) {
      // Update existing log
      const updatePayload: Record<string, unknown> = {
        status: 'connected', // Call is now connected via DID
        start_time: request.start_stamp,
        metadata: {
          ...existingCallLog.metadata,
          dialplan_request: request,
          timestamp: new Date().toISOString(),
          destination_info: destinationInfo
        }
      };
      if (destinationInfo) {
        updatePayload.partner_id = destinationInfo.partner_id;
        updatePayload.partner_phone = destinationInfo.partner_phone;
        updatePayload.customer_phone = destinationInfo.customer_phone;
        updatePayload.order_id = destinationInfo.order_id;
        updatePayload.transfer_destination = destinationInfo.customer_phone;
        updatePayload.call_type = 'partner_to_customer_masked'; // Ensure correct type
      }

      const { data, error } = await supabase
        .from('call_logs')
        .update(updatePayload)
        .eq('id', existingCallLog.id)
        .select('id')
        .single();

      if (error) {
        console.error('❌ Error updating call log:', error);
        throw error;
      }
      console.log('✅ Call log updated successfully:', data.id);
      return data.id;
    } else {
      // Insert new log if no existing UUID found (e.g., direct DID call)
      const insertPayload: Record<string, unknown> = {
        call_id: request.call_id,
        uuid: request.uuid,
        caller_number: request.caller_id_number, // Partner's number
        called_number: request.call_to_number, // DID number
        call_type: 'customer_to_partner_masked', // Default for direct DID calls
        status: 'initiated',
        virtual_number: ACEFONE_CONFIG.DID_NUMBER,
        start_time: request.start_stamp,
        metadata: {
          dialplan_request: request,
          timestamp: new Date().toISOString(),
          destination_info: destinationInfo
        }
      };
      if (destinationInfo) {
        insertPayload.partner_id = destinationInfo.partner_id;
        insertPayload.partner_phone = destinationInfo.partner_phone;
        insertPayload.customer_phone = destinationInfo.customer_phone;
        insertPayload.order_id = destinationInfo.order_id;
        insertPayload.transfer_destination = destinationInfo.customer_phone;
        insertPayload.call_type = 'partner_to_customer_masked'; // If destination found
      }

      const { data, error } = await supabase
        .from('call_logs')
        .insert(insertPayload)
        .select('id')
        .single();

      if (error) {
        console.error('❌ Error inserting new call log:', error);
        throw error;
      }
      console.log('✅ New call log inserted successfully:', data.id);
      return data.id;
    }
  } catch (error) {
    console.error('❌ Failed to log or update call:', error);
    throw error;
  }
}

// Helper function to find partner by phone number
async function findPartnerByPhone(phoneNumber: string) {
  try {
    const phoneFormats = generatePhoneFormats(phoneNumber);
    console.log('🔍 Searching for partner with phone formats:', phoneFormats);

    for (const format of phoneFormats) {
      const { data: partners, error } = await supabase
        .from('partners')
        .select('id, name, mobile, status')
        .eq('mobile', format)
        .eq('status', 'active')
        .limit(1);

      if (error) {
        console.error('❌ Error searching partners:', error);
        continue;
      }

      if (partners && partners.length > 0) {
        console.log('✅ Found partner:', partners[0]);
        return partners[0];
      }
    }

    console.log('❌ No active partner found for phone:', phoneNumber);
    return null;
  } catch (error) {
    console.error('❌ Error in findPartnerByPhone:', error);
    return null;
  }
}

// Helper function to find the most relevant active order for a partner
async function findRelevantOrderForPartner(partnerId: number) {
  try {
    // Tier 1: Active orders (assigned or in_progress)
    const { data: activeOrders, error: activeOrdersError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, mobile_number, status, service_date, time_slot, created_at')
      .eq('partner_id', partnerId)
      .in('status', ['assigned', 'in_progress'])
      .order('service_date', { ascending: true })
      .order('created_at', { ascending: false });

    if (activeOrdersError) {
      console.error('❌ Error fetching active orders:', activeOrdersError);
    }

    if (activeOrders && activeOrders.length > 0) {
      console.log(`✅ Found ${activeOrders.length} active orders for partner ${partnerId}.`);
      // Prioritize orders for today or upcoming
      const today = new Date().toISOString().split('T')[0];
      const relevantActiveOrders = activeOrders.filter(order =>
        order.service_date >= today || order.status === 'in_progress'
      );
      if (relevantActiveOrders.length > 0) {
        return relevantActiveOrders[0]; // Return the most relevant active order
      }
    }

    // Tier 2: Recently completed orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, mobile_number, status, service_date, time_slot, created_at')
      .eq('partner_id', partnerId)
      .eq('status', 'completed')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (recentOrdersError) {
      console.error('❌ Error fetching recent orders:', recentOrdersError);
    }

    if (recentOrders && recentOrders.length > 0) {
      console.log(`✅ Found ${recentOrders.length} recent orders for partner ${partnerId}.`);
      return recentOrders[0]; // Return the most recent completed order
    }

    // Tier 3: Any order for the partner (fallback)
    const { data: anyOrder, error: anyOrderError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, mobile_number, status, service_date, time_slot, created_at')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (anyOrderError) {
      console.error('❌ Error fetching any order:', anyOrderError);
    }

    if (anyOrder && anyOrder.length > 0) {
      console.log(`✅ Found any order for partner ${partnerId}.`);
      return anyOrder[0];
    }

    console.log('❌ No relevant order found for partner:', partnerId);
    return null;
  } catch (error) {
    console.error('❌ Error in findRelevantOrderForPartner:', error);
    return null;
  }
}

// Main API Dialplan webhook handler
export async function POST(request: NextRequest) {
  try {
    console.log('📞 Acefone API Dialplan Webhook Received');

    // Parse the request body from Acefone
    const dialplanRequest: AcefoneDialplanRequest = await request.json();
    console.log('📋 Dialplan Webhook Data:', dialplanRequest);

    // Validate required fields
    if (!dialplanRequest.uuid || !dialplanRequest.call_id || !dialplanRequest.caller_id_number || !dialplanRequest.call_to_number) {
      console.error('❌ Missing required fields in Acefone Dialplan webhook data');
      return NextResponse.json([{
        recording: {
          type: 'system',
          data: '1234' // Generic error recording ID
        }
      }], { status: 400 });
    }

    // Ensure the call is to our configured DID number
    const normalizedCalledNumber = formatPhoneForAcefone(dialplanRequest.call_to_number);
    const normalizedDidNumber = formatPhoneForAcefone(ACEFONE_CONFIG.DID_NUMBER);

    if (normalizedCalledNumber !== normalizedDidNumber) {
      console.error(`❌ Call to number ${dialplanRequest.call_to_number} does not match configured DID ${ACEFONE_CONFIG.DID_NUMBER}`);
      return NextResponse.json([{
        recording: {
          type: 'system',
          data: '1234' // Error: Invalid DID
        }
      }], { status: 400 });
    }

    // 1. Identify the partner who is calling the DID
    const partner = await findPartnerByPhone(dialplanRequest.caller_id_number);
    if (!partner) {
      console.log('❌ Partner not found or inactive for caller:', dialplanRequest.caller_id_number);
      // Log this event
      await logOrUpdateCall(dialplanRequest, { error: 'Partner not found' });
      return NextResponse.json([{
        recording: {
          type: 'system',
          data: '1234' // Replace with "Partner not found" recording ID
        }
      }]);
    }

    // 2. Find the most relevant order for this partner to determine the customer to connect to
    const relevantOrder = await findRelevantOrderForPartner(partner.id);
    if (!relevantOrder) {
      console.log('❌ No relevant order found for partner:', partner.id);
      // Log this event
      await logOrUpdateCall(dialplanRequest, { partner_id: partner.id, partner_phone: partner.mobile, error: 'No relevant order found' });
      return NextResponse.json([{
        recording: {
          type: 'system',
          data: '1234' // Replace with "No active customer" recording ID
        }
      }]);
    }

    const destinationInfo = {
      partner_id: partner.id,
      partner_phone: partner.mobile,
      customer_phone: relevantOrder.mobile_number,
      order_id: relevantOrder.id,
      order_number: relevantOrder.order_number,
      customer_name: relevantOrder.customer_name,
      partner_name: partner.name
    };

    // Log or update the call with destination information
    await logOrUpdateCall(dialplanRequest, destinationInfo);

    // 3. Instruct Acefone to transfer the call to the customer's actual number
    const transferPhone = formatPhoneForAcefone(destinationInfo.customer_phone);

    const acefoneResponse: AcefoneResponse[] = [{
      transfer: {
        type: 'number',
        data: [transferPhone], // Transfer to customer's actual number
        ring_type: 'order_by',
        skip_active: false
      }
    }];

    console.log('✅ Sending Acefone Dialplan response (transfer to customer):', acefoneResponse);
    console.log('📞 Transfer details:', {
      transferPhone,
      customerPhone: destinationInfo.customer_phone,
      partnerPhone: destinationInfo.partner_phone,
      orderNumber: destinationInfo.order_number
    });
    
    return NextResponse.json(acefoneResponse);

  } catch (error) {
    console.error('❌ Error in Acefone Dialplan webhook:', error);
    // Return a generic error response to Acefone
    return NextResponse.json([{
      recording: {
        type: 'system',
        data: '1234' // Generic error recording ID
      }
    }], { status: 500 });
  }
}

// Handle GET requests for testing/info
export async function GET() {
  return NextResponse.json({
    message: 'Acefone API Dialplan Webhook Endpoint',
    status: 'active',
    timestamp: new Date().toISOString(),
    config: {
      did_number: ACEFONE_CONFIG.DID_NUMBER,
      webhook_url: ACEFONE_CONFIG.WEBHOOK_URL
    }
  });
}