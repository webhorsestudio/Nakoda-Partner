import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ACEFONE_CONFIG, formatPhoneForAcefone, generatePhoneFormats } from '@/config/acefone';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types for Acefone webhook request
interface AcefoneWebhookRequest {
  uuid: string;
  call_id: string;
  call_to_number: string;
  caller_id_number: string;
  start_stamp: string;
  last_dtmf?: string;
}

// Types for Acefone response
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
    data: string;
    dtmf?: {
      timeout: number;
      maxLength: number;
      retry: number;
    };
  };
}

type AcefoneResponse = AcefoneTransferResponse | AcefoneRecordingResponse;

// Helper function to log incoming call
async function logIncomingCall(request: AcefoneWebhookRequest): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('call_logs')
      .insert({
        call_id: request.call_id,
        uuid: request.uuid,
        caller_number: request.caller_id_number,
        called_number: request.call_to_number,
        call_type: ACEFONE_CONFIG.CALL_TYPES.PARTNER_TO_CUSTOMER,
        status: ACEFONE_CONFIG.CALL_STATUS.INITIATED,
        virtual_number: ACEFONE_CONFIG.DID_NUMBER,
        start_time: request.start_stamp,
        metadata: {
          webhook_request: request,
          timestamp: new Date().toISOString()
        }
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Error logging incoming call:', error);
      throw error;
    }

    console.log('✅ Call logged successfully:', data.id);
    return data.id;
  } catch (error) {
    console.error('❌ Failed to log incoming call:', error);
    throw error;
  }
}

// Helper function to find partner by phone number
async function findPartnerByPhone(phoneNumber: string) {
  try {
    const phoneFormats = generatePhoneFormats(phoneNumber);
    console.log('🔍 Searching for partner with phone formats:', phoneFormats);

    // Try exact matches first
    for (const format of phoneFormats) {
      const { data: partners, error } = await supabase
        .from('partners')
        .select('id, name, mobile, status, service_type, city')
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

    // If no exact match, try partial matches
    const last10Digits = phoneNumber.replace(/\D/g, '').slice(-10);
    const { data: partners, error } = await supabase
      .from('partners')
      .select('id, name, mobile, status, service_type, city')
      .like('mobile', `%${last10Digits}`)
      .eq('status', 'active')
      .limit(5);

    if (error) {
      console.error('❌ Error in partial partner search:', error);
      return null;
    }

    if (partners && partners.length > 0) {
      // Find exact match within partial results
      const exactMatch = partners.find(p => 
        p.mobile.replace(/\D/g, '') === last10Digits
      );
      
      if (exactMatch) {
        console.log('✅ Found partner via partial search:', exactMatch);
        return exactMatch;
      }
    }

    console.log('❌ No partner found for phone:', phoneNumber);
    return null;
  } catch (error) {
    console.error('❌ Error in findPartnerByPhone:', error);
    return null;
  }
}

// Helper function to find active orders for a partner
async function findActiveOrdersByPartnerId(partnerId: number) {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_number, mobile_number, customer_name, service_date, time_slot, status, created_at')
      .eq('partner_id', partnerId)
      .in('status', ['assigned', 'in_progress', 'completed'])
      .order('service_date', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching active orders:', error);
      return [];
    }

    console.log('📋 Found active orders:', orders?.length || 0);
    return orders || [];
  } catch (error) {
    console.error('❌ Error in findActiveOrdersByPartnerId:', error);
    return [];
  }
}

// Helper function to select the best order to call
function selectBestOrderToCall(orders: Array<{
  id: string;
  order_number: string;
  mobile_number: string;
  customer_name: string;
  service_date: string;
  time_slot: string;
  status: string;
  created_at: string;
}>): {
  id: string;
  order_number: string;
  mobile_number: string;
  customer_name: string;
  service_date: string;
  time_slot: string;
  status: string;
  created_at: string;
} | null {
  if (!orders || orders.length === 0) {
    return null;
  }

  if (orders.length === 1) {
    return orders[0];
  }

  // Sort by priority: today's orders first, then upcoming, then by order number
  const sortedOrders = orders.sort((a, b) => {
    const today = new Date().toDateString();
    const aIsToday = new Date(a.service_date || '').toDateString() === today;
    const bIsToday = new Date(b.service_date || '').toDateString() === today;

    // Today's orders first
    if (aIsToday && !bIsToday) return -1;
    if (!aIsToday && bIsToday) return 1;

    // Then by status priority
    const statusPriority = { 'in_progress': 1, 'assigned': 2, 'completed': 3 };
    const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 4;
    const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 4;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // Then by order number (newest first)
    return b.order_number.localeCompare(a.order_number);
  });

  console.log('🎯 Selected best order:', sortedOrders[0]);
  return sortedOrders[0];
}

// Helper function to determine call destination
async function determineCallDestination(request: AcefoneWebhookRequest) {
  try {
    console.log('🎯 Determining call destination for:', request.caller_id_number);

    // Check if this is a call to our DID number
    const normalizedCalledNumber = request.call_to_number.replace(/\D/g, '');
    const normalizedDidNumber = ACEFONE_CONFIG.DID_NUMBER.replace(/\D/g, '');
    
    const isCallToDid = normalizedCalledNumber === normalizedDidNumber ||
                       normalizedCalledNumber === `91${normalizedDidNumber}` ||
                       normalizedCalledNumber === `+91${normalizedDidNumber}` ||
                       normalizedCalledNumber.endsWith(normalizedDidNumber);

    if (!isCallToDid) {
      console.log('❌ Not a call to our DID number');
      return null;
    }

    // Find the partner
    const partner = await findPartnerByPhone(request.caller_id_number);
    if (!partner) {
      console.log('❌ Partner not found for caller:', request.caller_id_number);
      return null;
    }

    // Find active orders for the partner
    const activeOrders = await findActiveOrdersByPartnerId(partner.id);
    if (activeOrders.length === 0) {
      console.log('❌ No active orders found for partner:', partner.id);
      return null;
    }

    // Select the best order to call
    const selectedOrder = selectBestOrderToCall(activeOrders);
    if (!selectedOrder) {
      console.log('❌ No suitable order selected for calling');
      return null;
    }

    // Format customer phone number for Acefone
    const customerPhone = formatPhoneForAcefone(selectedOrder.mobile_number);

    console.log('✅ Call destination determined:', {
      partner: partner.name,
      customer: selectedOrder.customer_name,
      customerPhone,
      orderNumber: selectedOrder.order_number
    });

    return {
      partner_id: partner.id,
      partner_phone: request.caller_id_number,
      customer_phone: customerPhone,
      order_id: selectedOrder.id,
      order_number: selectedOrder.order_number,
      customer_name: selectedOrder.customer_name,
      partner_name: partner.name
    };
  } catch (error) {
    console.error('❌ Error determining call destination:', error);
    return null;
  }
}

// Helper function to update call log with destination info
async function updateCallLogWithDestination(
  callLogId: string, 
  destinationInfo: {
    partner_id: number;
    partner_phone: string;
    customer_phone: string;
    order_id: string;
    order_number: string;
    customer_name: string;
    partner_name: string;
  }
) {
  try {
    const { error } = await supabase
      .from('call_logs')
      .update({
        partner_id: destinationInfo.partner_id,
        partner_phone: destinationInfo.partner_phone,
        customer_phone: destinationInfo.customer_phone,
        order_id: destinationInfo.order_id,
        transfer_destination: destinationInfo.customer_phone,
        metadata: {
          partner_name: destinationInfo.partner_name || 'Unknown Partner',
          order_number: destinationInfo.order_number,
          customer_name: destinationInfo.customer_name
        }
      })
      .eq('id', callLogId);

    if (error) {
      console.error('❌ Error updating call log:', error);
      throw error;
    }

    console.log('✅ Call log updated with destination info');
  } catch (error) {
    console.error('❌ Failed to update call log:', error);
    throw error;
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    console.log('📞 Acefone Dialplan Webhook Received');
    
    // Parse the request body
    const webhookData: AcefoneWebhookRequest = await request.json();
    console.log('📋 Webhook Data:', webhookData);

    // Validate required fields
    if (!webhookData.uuid || !webhookData.call_id || !webhookData.caller_id_number) {
      console.error('❌ Missing required fields in webhook data');
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Log the incoming call
    const callLogId = await logIncomingCall(webhookData);

    // Determine call destination
    const destinationInfo = await determineCallDestination(webhookData);
    
    if (!destinationInfo) {
      console.log('❌ Could not determine call destination');
      
      // Return error response to Acefone
      return NextResponse.json([{
        recording: {
          type: 'system',
          data: '1234' // Replace with your error message recording ID
        }
      }]);
    }

    // Update call log with destination info
    await updateCallLogWithDestination(callLogId, destinationInfo);

    // Format customer phone for Acefone transfer
    const transferPhone = formatPhoneForAcefone(destinationInfo.customer_phone);

    // Create Acefone response
    const acefoneResponse: AcefoneResponse[] = [{
      transfer: {
        type: ACEFONE_CONFIG.TRANSFER_TYPES.NUMBER,
        data: [transferPhone],
        ring_type: ACEFONE_CONFIG.RING_TYPE,
        skip_active: ACEFONE_CONFIG.SKIP_ACTIVE
      }
    }];

    console.log('✅ Sending Acefone response:', acefoneResponse);

    return NextResponse.json(acefoneResponse);

  } catch (error) {
    console.error('❌ Error in Acefone Dialplan webhook:', error);
    
    // Return error response to Acefone
    return NextResponse.json([{
      recording: {
        type: 'system',
        data: '1234' // Replace with your error message recording ID
      }
    }], { status: 500 });
  }
}

// Handle GET requests for testing
export async function GET() {
  return NextResponse.json({
    message: 'Acefone Dialplan Webhook Endpoint',
    status: 'active',
    timestamp: new Date().toISOString(),
    config: {
      did_number: ACEFONE_CONFIG.DID_NUMBER,
      webhook_url: ACEFONE_CONFIG.WEBHOOK_URL
    }
  });
}
