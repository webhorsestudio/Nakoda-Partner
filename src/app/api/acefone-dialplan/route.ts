import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ACEFONE_CONFIG, CALL_STATUS, CALL_TYPES } from '@/config/acefone';
import { supabaseAdmin } from '@/lib/supabase';

// Request validation schema based on Acefone documentation
const AcefoneDialplanSchema = z.object({
  uuid: z.string().optional(),
  call_id: z.string().optional(), 
  call_to_number: z.string().optional(),
  caller_id_number: z.string().optional(),
  start_stamp: z.string().optional(),
  // Additional variables that might be sent
  last_dtmf: z.string().optional(),
  dtmf: z.string().optional(),
});

// Response schema for API Dialplan
interface TransferResponse {
  transfer: {
    type: string;
    data: string[];
    ring_type?: string;
    skip_active?: boolean;
    moh?: string;
    disable_call_recording?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('📞 Acefone API Dialplan webhook received');
    
    // Parse and validate request body
    const body = await request.json();
    console.log('📞 Request body:', body);
    
    const validatedData = AcefoneDialplanSchema.parse(body);
    const { 
      uuid, 
      call_id, 
      call_to_number, 
      caller_id_number, 
      start_stamp 
    } = validatedData;
    
    console.log('📞 Parsed data:', {
      uuid,
      call_id,
      call_to_number,
      caller_id_number,
      start_stamp
    });
    
    // Log the incoming call
    await logIncomingCall({
      uuid: uuid || '',
      call_id: call_id || '',
      caller_number: caller_id_number || '',
      called_number: call_to_number || '',
      start_time: start_stamp || new Date().toISOString(),
      status: CALL_STATUS.INITIATED
    });
    
    // Determine the destination based on the called number
    // For now, we'll use a simple approach - you can enhance this later
    const destinationNumber = await determineCallDestination(call_to_number, caller_id_number);
    
    if (!destinationNumber) {
      console.log('❌ No destination found, using failover');
      return NextResponse.json([
        {
          transfer: {
            type: 'hangup' // or 'voicemail' based on your failover setting
          }
        }
      ]);
    }
    
    console.log('📞 Routing call to:', destinationNumber);
    
    // Create transfer response based on Acefone documentation
    const transferResponse: TransferResponse = {
      transfer: {
        type: ACEFONE_CONFIG.TRANSFER_TYPES.NUMBER,
        data: [destinationNumber],
        ring_type: ACEFONE_CONFIG.CALL_SETTINGS.RING_TYPE,
        skip_active: ACEFONE_CONFIG.CALL_SETTINGS.SKIP_ACTIVE,
        disable_call_recording: ACEFONE_CONFIG.CALL_SETTINGS.DISABLE_CALL_RECORDING
      }
    };
    
    // Add music on hold if configured
    if (ACEFONE_CONFIG.CALL_SETTINGS.MUSIC_ON_HOLD) {
      transferResponse.transfer.moh = ACEFONE_CONFIG.CALL_SETTINGS.MUSIC_ON_HOLD;
    }
    
    console.log('📞 Sending transfer response:', transferResponse);
    
    // Return the transfer response as array (required by Acefone)
    return NextResponse.json([transferResponse]);
    
  } catch (error) {
    console.error('❌ Acefone API Dialplan error:', error);
    
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.issues);
      return NextResponse.json([
        {
          transfer: {
            type: 'hangup'
          }
        }
      ], { status: 400 });
    }
    
    // Return failover response on any error
    return NextResponse.json([
      {
        transfer: {
          type: 'hangup' // or your configured failover destination
        }
      }
    ], { status: 500 });
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testCall = searchParams.get('test');
    
    if (testCall === 'true') {
      // Simulate a test call
      const testData = {
        uuid: 'test-uuid-123',
        call_id: 'test-call-456',
        call_to_number: ACEFONE_CONFIG.DID_NUMBER,
        caller_id_number: '9876543210',
        start_stamp: new Date().toISOString()
      };
      
      console.log('🧪 Test call simulation:', testData);
      
      const destinationNumber = await determineCallDestination(
        testData.call_to_number, 
        testData.caller_id_number
      );
      
      return NextResponse.json({
        success: true,
        message: 'Test call processed',
        testData,
        destinationNumber,
        config: {
          didNumber: ACEFONE_CONFIG.DID_NUMBER,
          webhookUrl: ACEFONE_CONFIG.API_DIALPLAN.WEBHOOK_URL
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Acefone API Dialplan endpoint is ready',
      config: {
        didNumber: ACEFONE_CONFIG.DID_NUMBER,
        webhookUrl: ACEFONE_CONFIG.API_DIALPLAN.WEBHOOK_URL,
        requestMethod: ACEFONE_CONFIG.API_DIALPLAN.REQUEST_METHOD,
        failoverDestination: ACEFONE_CONFIG.API_DIALPLAN.FAILOVER_DESTINATION
      },
      instructions: [
        '1. Configure this endpoint in your Acefone dashboard',
        '2. Set the URL to: ' + ACEFONE_CONFIG.API_DIALPLAN.WEBHOOK_URL,
        '3. Set request method to: ' + ACEFONE_CONFIG.API_DIALPLAN.REQUEST_METHOD,
        '4. Set failover destination to: ' + ACEFONE_CONFIG.API_DIALPLAN.FAILOVER_DESTINATION,
        '5. Test by calling your DID number: ' + ACEFONE_CONFIG.DID_NUMBER
      ]
    });
    
  } catch (error) {
    console.error('❌ GET endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Format phone number for consistent comparison
 */
function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it's 10 digits, add 91 (without +)
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  
  // If it already has country code, return as is
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned;
  }
  
  // If it already has +91, remove the +
  if (phone.startsWith('+91')) {
    return phone.substring(1);
  }
  
  // Default: add 91 (without +)
  return `91${cleaned}`;
}

/**
 * Enhanced call routing logic based on business requirements
 */
async function determineCallDestination(
  calledNumber?: string, 
  callerNumber?: string
): Promise<string | null> {
  try {
    console.log('🔍 Determining call destination:', { calledNumber, callerNumber });
    
    if (!calledNumber || !callerNumber) {
      console.log('❌ Missing call information');
      return null;
    }
    
    // Check if this is a call to your DID number
    if (calledNumber === ACEFONE_CONFIG.DID_NUMBER) {
      console.log('📞 Call to DID number detected');
      
      // Format the caller number for consistent comparison
      const formattedCallerNumber = formatPhoneNumber(callerNumber);
      console.log('📞 Formatted caller number:', formattedCallerNumber);
      
      // Strategy 1: Look up active order by customer phone number
      const activeOrder = await findActiveOrderByCustomerPhone(formattedCallerNumber);
      if (activeOrder) {
        console.log('✅ Found active order for customer:', activeOrder.id);
        return activeOrder.partner_phone;
      }
      
      // Strategy 2: Look up partner by customer phone in recent orders
      const recentOrder = await findRecentOrderByCustomerPhone(formattedCallerNumber);
      if (recentOrder) {
        console.log('✅ Found recent order for customer:', recentOrder.id);
        return recentOrder.partner_phone;
      }
      
      // Strategy 3: Look up partner by customer phone in any order
      const anyOrder = await findAnyOrderByCustomerPhone(formattedCallerNumber);
      if (anyOrder) {
        console.log('✅ Found any order for customer:', anyOrder.id);
        return anyOrder.partner_phone;
      }
      
      console.log('❌ No orders found for caller:', formattedCallerNumber);
      return null;
    }
    
    console.log('❌ Call not to DID number, no routing available');
    return null;
    
  } catch (error) {
    console.error('❌ Error determining call destination:', error);
    return null;
  }
}

/**
 * Find active order by customer phone number
 */
async function findActiveOrderByCustomerPhone(customerPhone: string) {
  try {
    // First, get the order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        partner_id,
        mobile_number,
        customer_name,
        status,
        partner_completion_status
      `)
      .eq('mobile_number', customerPhone)
      .in('status', ['assigned', 'in-progress'])
      .neq('partner_completion_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error finding active order:', error);
      return null;
    }
    
    if (!order) {
      console.log('No active order found for customer:', customerPhone);
      return null;
    }

    // Then get the partner details
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('partners')
      .select('id, phone, name, status')
      .eq('id', order.partner_id)
      .eq('status', 'active')
      .single();

    if (partnerError || !partner) {
      console.error('Error finding partner or partner not active:', partnerError);
      return null;
    }
    
    return {
      id: order.id,
      partner_id: order.partner_id,
      partner_phone: partner.phone,
      partner_name: partner.name,
      customer_name: order.customer_name,
      status: order.status
    };
  } catch (error) {
    console.error('Error finding active order:', error);
    return null;
  }
}

/**
 * Find recent order by customer phone number (last 7 days)
 */
async function findRecentOrderByCustomerPhone(customerPhone: string) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // First, get the order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        partner_id,
        mobile_number,
        customer_name,
        status,
        created_at
      `)
      .eq('mobile_number', customerPhone)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error finding recent order:', error);
      return null;
    }
    
    if (!order) {
      console.log('No recent order found for customer:', customerPhone);
      return null;
    }

    // Then get the partner details
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('partners')
      .select('id, phone, name, status')
      .eq('id', order.partner_id)
      .eq('status', 'active')
      .single();

    if (partnerError || !partner) {
      console.error('Error finding partner or partner not active:', partnerError);
      return null;
    }
    
    return {
      id: order.id,
      partner_id: order.partner_id,
      partner_phone: partner.phone,
      partner_name: partner.name,
      customer_name: order.customer_name,
      status: order.status,
      created_at: order.created_at
    };
  } catch (error) {
    console.error('Error finding recent order:', error);
    return null;
  }
}

/**
 * Find any order by customer phone number
 */
async function findAnyOrderByCustomerPhone(customerPhone: string) {
  try {
    // First, get the order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        partner_id,
        mobile_number,
        customer_name,
        status,
        created_at
      `)
      .eq('mobile_number', customerPhone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error finding any order:', error);
      return null;
    }
    
    if (!order) {
      console.log('No order found for customer:', customerPhone);
      return null;
    }

    // Then get the partner details
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('partners')
      .select('id, phone, name, status')
      .eq('id', order.partner_id)
      .eq('status', 'active')
      .single();

    if (partnerError || !partner) {
      console.error('Error finding partner or partner not active:', partnerError);
      return null;
    }
    
    return {
      id: order.id,
      partner_id: order.partner_id,
      partner_phone: partner.phone,
      partner_name: partner.name,
      customer_name: order.customer_name,
      status: order.status,
      created_at: order.created_at
    };
  } catch (error) {
    console.error('Error finding any order:', error);
    return null;
  }
}

/**
 * Log incoming call to database
 */
async function logIncomingCall(callData: {
  uuid: string;
  call_id: string;
  caller_number: string;
  called_number: string;
  start_time: string;
  status: string;
}) {
  try {
    const { error } = await supabaseAdmin
      .from('call_logs')
      .insert({
        call_id: callData.call_id,
        uuid: callData.uuid,
        caller_number: callData.caller_number,
        called_number: callData.called_number,
        call_type: CALL_TYPES.CUSTOMER_TO_PARTNER,
        status: callData.status,
        start_time: callData.start_time,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('❌ Error logging call:', error);
    } else {
      console.log('✅ Call logged successfully:', callData.call_id);
    }
  } catch (error) {
    console.error('❌ Error in logIncomingCall:', error);
  }
}
