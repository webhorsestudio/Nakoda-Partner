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
    
    // Determine call type first
    const formattedCallerNumber = formatPhoneNumber(caller_id_number || '');
    
    const isPartnerCall = await findPartnerByPhone(formattedCallerNumber);
    console.log('🔍 DEBUG: Partner found:', isPartnerCall ? 'YES' : 'NO');
    if (isPartnerCall) {
      console.log('🔍 DEBUG: Partner details:', isPartnerCall);
    }
    
    // Since we only handle partner-to-customer calls, set call type accordingly
    const callType = isPartnerCall ? CALL_TYPES.PARTNER_TO_CUSTOMER : CALL_TYPES.CUSTOMER_TO_PARTNER;
    console.log('🔍 DEBUG: Call type determined as:', callType);
    
    // Log the incoming call
    await logIncomingCall({
      uuid: uuid || '',
      call_id: call_id || '',
      caller_number: caller_id_number || '', // Partner's phone
      called_number: call_to_number || '', // Initially the DID, will be updated to customer's phone
      start_time: start_stamp || new Date().toISOString(),
      status: CALL_STATUS.INITIATED,
      call_type: callType,
      partner_id: undefined, // Will be updated when we find the destination
      order_id: undefined // Will be updated when we find the destination
    });
    
    // Determine the destination based on the called number
    const destinationInfo = await determineCallDestination(call_to_number, caller_id_number);
    console.log('🔍 DEBUG: Destination info:', destinationInfo);
    
    if (!destinationInfo) {
      console.log('❌ No destination found, using failover');
      return NextResponse.json([
        {
          transfer: {
            type: 'hangup' // or 'voicemail' based on your failover setting
          }
        }
      ]);
    }
    
    console.log('📞 Routing call to customer:', destinationInfo.customer_phone);
    
    // Update the call log with partner and order information
    await updateCallLogWithDestination(call_id || '', destinationInfo);
    
    // Create transfer response based on Acefone documentation
    const transferResponse: TransferResponse = {
      transfer: {
        type: ACEFONE_CONFIG.TRANSFER_TYPES.NUMBER,
        data: [destinationInfo.customer_phone], // Transfer to customer's phone
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
  
  console.log('📞 Formatting phone:', phone, '→ cleaned:', cleaned);
  
  // For partner lookup, we want to use 10-digit format (as stored in database)
  // Convert any format to 10-digit format for consistent database lookup
  if (cleaned.length === 10) {
    console.log('📞 10 digits → keeping as is:', cleaned);
    return cleaned;
  }
  
  // If it has country code (91), remove it to get 10-digit format
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    const tenDigit = cleaned.substring(2);
    console.log('📞 12 digits with 91 → removing 91:', tenDigit);
    return tenDigit;
  }
  
  // If it has +91, remove the + and 91 to get 10-digit format
  if (phone.startsWith('+91')) {
    const tenDigit = phone.substring(3);
    console.log('📞 +91 format → removing +91:', tenDigit);
    return tenDigit;
  }
  
  // For any other format, try to extract 10 digits
  if (cleaned.length > 10) {
    // Take last 10 digits
    const tenDigit = cleaned.slice(-10);
    console.log('📞 Long number → taking last 10 digits:', tenDigit);
    return tenDigit;
  }
  
  // If less than 10 digits, pad with zeros (shouldn't happen in normal cases)
  const padded = cleaned.padStart(10, '0');
  console.log('📞 Short number → padding:', padded);
  return padded;
}

/**
 * Generate multiple phone number formats for database matching
 */
function generatePhoneFormats(phone: string): string[] {
  if (!phone) return [];
  
  const cleaned = phone.replace(/\D/g, '');
  const formats = new Set<string>();
  
  // Add original phone
  formats.add(phone);
  
  // Add cleaned version
  formats.add(cleaned);
  
  // Add with +91 prefix
  if (!phone.startsWith('+91')) {
    formats.add(`+91${cleaned}`);
  }
  
  // Add with 91 prefix (no +)
  if (!cleaned.startsWith('91')) {
    formats.add(`91${cleaned}`);
  }
  
  // Add 10-digit format (as stored in database) - prioritize this format
  let tenDigitFormat = '';
  if (cleaned.length === 10) {
    tenDigitFormat = cleaned;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    tenDigitFormat = cleaned.substring(2);
  } else if (phone.startsWith('+91')) {
    tenDigitFormat = phone.substring(3);
  } else if (cleaned.length > 10) {
    tenDigitFormat = cleaned.slice(-10);
  }
  
  if (tenDigitFormat) {
    formats.add(tenDigitFormat);
  }
  
  // Add without +91 prefix
  if (phone.startsWith('+91')) {
    formats.add(phone.substring(1));
  }
  
  console.log('📞 Generated phone formats:', Array.from(formats));
  return Array.from(formats);
}

/**
 * Enhanced call routing logic based on business requirements
 */
async function determineCallDestination(
  calledNumber?: string, 
  callerNumber?: string
): Promise<{
  partner_phone: string;
  partner_id: number;
  order_id: string;
  customer_phone: string;
} | null> {
  try {
    console.log('🔍 Determining call destination:', { calledNumber, callerNumber });
    
    if (!calledNumber || !callerNumber) {
      console.log('❌ Missing call information');
      return null;
    }
    
    // Check if this is a call to your DID number (handle different formats)
    const normalizedCalledNumber = calledNumber.replace(/\D/g, '');
    const normalizedDidNumber = ACEFONE_CONFIG.DID_NUMBER.replace(/\D/g, '');
    
    console.log('🔍 DEBUG: Called number:', calledNumber, 'Normalized:', normalizedCalledNumber);
    console.log('🔍 DEBUG: DID number:', ACEFONE_CONFIG.DID_NUMBER, 'Normalized:', normalizedDidNumber);
    
    // Check if the call is to our DID number (handle various formats)
    // Acefone sends the DID number with 91 prefix, so we need to handle both formats
    let isCallToDid = false;
    
    // Direct match
    if (normalizedCalledNumber === normalizedDidNumber) {
      isCallToDid = true;
    }
    // Match with 91 prefix
    else if (normalizedCalledNumber === `91${normalizedDidNumber}`) {
      isCallToDid = true;
    }
    // Match with +91 prefix
    else if (normalizedCalledNumber === `+91${normalizedDidNumber}`) {
      isCallToDid = true;
    }
    // Match if called number ends with DID number
    else if (normalizedCalledNumber.endsWith(normalizedDidNumber)) {
      isCallToDid = true;
    }
    // Special case: if called number is "918065343250" and DID is "8065343250" (without leading 0)
    else if (normalizedCalledNumber === '918065343250' && normalizedDidNumber === '8065343250') {
      isCallToDid = true;
    }
    // Handle legacy case: if called number is "918065343250" and DID is "08065343250" (with leading 0)
    else if (normalizedCalledNumber === '918065343250' && normalizedDidNumber === '08065343250') {
      isCallToDid = true;
    }
    
    console.log('🔍 DEBUG: Is call to DID?', isCallToDid);
    
    if (isCallToDid) {
      console.log('📞 Call to DID number detected');
      
      // Format the caller number for consistent comparison
      const formattedCallerNumber = formatPhoneNumber(callerNumber);
      console.log('📞 Formatted caller number:', formattedCallerNumber);
      
      // ONLY handle partner-to-customer calls
      // Partner calls DID → Route to customer
      const partnerCall = await findPartnerByPhone(formattedCallerNumber);
      if (partnerCall) {
        console.log('📞 Partner calling DID - looking for their active orders');
        // Partner is calling DID - find their active order and route to customer
        const activeOrder = await findActiveOrderByPartnerId(partnerCall.id);
      if (activeOrder) {
          console.log('✅ Found active order for partner:', activeOrder.id);
          
          // Format customer phone number for transfer (Acefone expects +91 format)
          const customerPhone = activeOrder.mobile_number || '';
          const formattedCustomerPhone = customerPhone.startsWith('+91') ? customerPhone : 
                                        customerPhone.startsWith('91') ? `+${customerPhone}` :
                                        `+91${customerPhone}`;
          
          console.log('📞 Customer phone:', customerPhone, '→ Formatted:', formattedCustomerPhone);
          
          // Route the call to the customer (not back to partner)
          return {
            partner_phone: formattedCallerNumber, // Partner's phone (the caller)
            partner_id: partnerCall.id,
            order_id: activeOrder.id,
            customer_phone: formattedCustomerPhone // Customer's phone (formatted for transfer)
          };
        } else {
          console.log('❌ No active order found for partner:', partnerCall.id);
          return null;
        }
      }
      
      // If caller is not a partner, reject the call
      console.log('❌ Caller is not a registered partner, rejecting call');
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
 * Find partner by phone number
 */
async function findPartnerByPhone(phoneNumber: string) {
  try {
    console.log('🔍 Searching for partner with phone:', phoneNumber);
    
    // Generate multiple phone number formats
    const phoneFormats = generatePhoneFormats(phoneNumber);
    
    console.log('📞 Trying phone formats:', phoneFormats);
    
    // Try each phone format until we find a partner
    for (const format of phoneFormats) {
      console.log(`🔍 Trying format: ${format}`);
      
      // Get all partners with this phone format (handle multiple results)
      const { data: partners, error } = await supabaseAdmin
        .from('partners')
        .select('id, mobile, name, status')
        .eq('mobile', format);
      
      if (error) {
        console.log(`❌ Error with format ${format}:`, error.message);
        continue;
      }
      
      console.log(`📞 Format ${format} returned ${partners?.length || 0} partners:`, partners);
      
      if (partners && partners.length > 0) {
        // Select the best partner (Active > Pending > Suspended)
        let selectedPartner = null;
        
        if (partners.length === 1) {
          selectedPartner = partners[0];
        } else {
          console.log(`🔍 Found ${partners.length} partners with same mobile, selecting best one...`);
          
          // Prioritize: Active > Pending > Suspended
          const activePartner = partners.find(p => p.status === 'Active');
          const pendingPartner = partners.find(p => p.status === 'Pending');
          
          selectedPartner = activePartner || pendingPartner || partners[0];
        }
        
        if (selectedPartner) {
          console.log('✅ Found partner:', selectedPartner.name, 'with phone:', selectedPartner.mobile, 'status:', selectedPartner.status);
          return selectedPartner;
        }
      }
    }
    
    // If no exact match found, try a broader search
    console.log('🔍 No exact match found, trying broader search...');
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    console.log('🔍 Cleaned phone for broader search:', cleanedPhone);
    
    // Try to find partners with similar phone numbers
    const { data: similarPartners, error: similarError } = await supabaseAdmin
      .from('partners')
      .select('id, mobile, name, status')
      .like('mobile', `%${cleanedPhone.slice(-10)}%`); // Search for last 10 digits
    
    if (!similarError && similarPartners && similarPartners.length > 0) {
      console.log('🔍 Found similar partners:', similarPartners);
      
      // Find exact match in similar partners
      const exactMatch = similarPartners.find(p => {
        const partnerPhone = p.mobile.replace(/\D/g, '');
        return partnerPhone === cleanedPhone || 
               partnerPhone === cleanedPhone.slice(-10) ||
               cleanedPhone === partnerPhone.slice(-10);
      });
      
      if (exactMatch) {
        console.log('✅ Found exact match in similar partners:', exactMatch);
        return exactMatch;
      }
    }
    
    console.log('❌ No partner found with any phone format for:', phoneNumber);
    return null;
    
  } catch (error) {
    console.error('❌ Error in findPartnerByPhone:', error);
    return null;
  }
}

/**
 * Find the most appropriate active order for a partner to call
 * Handles cases where partner has multiple active orders
 */
async function findActiveOrderByPartnerId(partnerId: number) {
  try {
    console.log('🔍 Searching for active orders for partner ID:', partnerId);
    
    // Get ALL active orders for the partner
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        partner_id,
        mobile_number,
        customer_name,
        status,
        partner_completion_status,
        created_at,
        service_date,
        time_slot,
        order_number
      `)
      .eq('partner_id', partnerId)
      .in('status', ['assigned', 'in-progress'])
      .neq('partner_completion_status', 'completed')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Error finding active orders for partner:', error.message);
      return null;
    }
    
    if (!orders || orders.length === 0) {
      console.log('❌ No active orders found for partner:', partnerId);
      return null;
    }

    console.log(`📋 Found ${orders.length} active orders for partner ${partnerId}`);
    
    // If only one order, return it
    if (orders.length === 1) {
      const order = orders[0];
      console.log('✅ Single active order found:', order.id, 'customer:', order.mobile_number);
      return order;
    }
    
    // Multiple orders - need to determine the best one to call
    console.log('🔍 Multiple active orders found, determining best order to call...');
    
    // Strategy: Prioritize orders based on multiple factors
    const prioritizedOrder = selectBestOrderToCall(orders);
    
    if (prioritizedOrder) {
      console.log('✅ Selected best order to call:', prioritizedOrder.id, 'customer:', prioritizedOrder.mobile_number);
      return prioritizedOrder;
    }
    
    // Fallback: Return the most recent order
    const fallbackOrder = orders[0];
    console.log('⚠️ Using fallback - most recent order:', fallbackOrder.id, 'customer:', fallbackOrder.mobile_number);
    return fallbackOrder;
    
  } catch (error) {
    console.error('❌ Error in findActiveOrderByPartnerId:', error);
    return null;
  }
}

/**
 * Select the best order to call when partner has multiple active orders
 * Uses intelligent prioritization based on business logic and order numbers
 */
function selectBestOrderToCall(orders: Array<{
  id: string;
  order_number?: string;
  customer_name?: string;
  status: string;
  service_date?: string;
  time_slot?: string;
  created_at: string;
  mobile_number?: string;
}>) {
  try {
    console.log('🎯 Selecting best order from', orders.length, 'active orders');
    
    // Log all orders for debugging
    orders.forEach((order, index) => {
      console.log(`📋 Order ${index + 1}: ${order.order_number || 'No Order Number'} - ${order.customer_name || 'No Customer'} - Status: ${order.status} - Service Date: ${order.service_date || 'No Date'}`);
    });
    
    // Strategy 1: Prioritize orders with service_date today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const todayOrders = orders.filter(order => {
      if (!order.service_date) return false;
      const serviceDate = new Date(order.service_date).toISOString().split('T')[0];
      return serviceDate === todayStr;
    });
    
    if (todayOrders.length > 0) {
      console.log('📅 Found', todayOrders.length, 'orders scheduled for today');
      
      // Among today's orders, prioritize by order number (alphabetical/numerical order)
      const sortedTodayOrders = todayOrders.sort((a, b) => {
        const orderA = a.order_number || '';
        const orderB = b.order_number || '';
        
        // If both have order numbers, sort alphabetically
        if (orderA && orderB) {
          return orderA.localeCompare(orderB);
        }
        
        // If only one has order number, prioritize it
        if (orderA && !orderB) return -1;
        if (!orderA && orderB) return 1;
        
        // If neither has order number, sort by time slot
        const timeA = getTimeSlotPriority(a.time_slot || '');
        const timeB = getTimeSlotPriority(b.time_slot || '');
        return timeA - timeB;
      });
      
      console.log('📅 Selected order for today:', sortedTodayOrders[0].order_number, sortedTodayOrders[0].id);
      return sortedTodayOrders[0];
    }
    
    // Strategy 2: Prioritize orders with upcoming service dates
    const upcomingOrders = orders.filter(order => {
      if (!order.service_date) return false;
      const serviceDate = new Date(order.service_date);
      return serviceDate >= today;
    });
    
    if (upcomingOrders.length > 0) {
      console.log('📅 Found', upcomingOrders.length, 'orders with upcoming service dates');
      
      // Sort by service date first, then by order number
      const sortedUpcomingOrders = upcomingOrders.sort((a, b) => {
        const dateA = new Date(a.service_date || '');
        const dateB = new Date(b.service_date || '');
        
        // If same date, sort by order number
        if (dateA.getTime() === dateB.getTime()) {
          const orderA = a.order_number || '';
          const orderB = b.order_number || '';
          return orderA.localeCompare(orderB);
        }
        
        return dateA.getTime() - dateB.getTime();
      });
      
      console.log('📅 Selected earliest upcoming order:', sortedUpcomingOrders[0].order_number, sortedUpcomingOrders[0].id);
      return sortedUpcomingOrders[0];
    }
    
    // Strategy 3: Prioritize by status (in-progress > assigned) and order number
    const inProgressOrders = orders.filter(order => order.status === 'in-progress');
    if (inProgressOrders.length > 0) {
      console.log('🔄 Found', inProgressOrders.length, 'in-progress orders');
      
      // Sort by order number (alphabetical order)
      const sortedInProgressOrders = inProgressOrders.sort((a, b) => {
        const orderA = a.order_number || '';
        const orderB = b.order_number || '';
        
        if (orderA && orderB) {
          return orderA.localeCompare(orderB);
        }
        
        // If only one has order number, prioritize it
        if (orderA && !orderB) return -1;
        if (!orderA && orderB) return 1;
        
        // If neither has order number, sort by creation date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      console.log('🔄 Selected in-progress order:', sortedInProgressOrders[0].order_number, sortedInProgressOrders[0].id);
      return sortedInProgressOrders[0];
    }
    
    // Strategy 4: Fallback to assigned orders sorted by order number
    const assignedOrders = orders.filter(order => order.status === 'assigned');
    if (assignedOrders.length > 0) {
      console.log('📋 Found', assignedOrders.length, 'assigned orders');
      
      // Sort by order number (alphabetical order)
      const sortedAssignedOrders = assignedOrders.sort((a, b) => {
        const orderA = a.order_number || '';
        const orderB = b.order_number || '';
        
        if (orderA && orderB) {
          return orderA.localeCompare(orderB);
        }
        
        // If only one has order number, prioritize it
        if (orderA && !orderB) return -1;
        if (!orderA && orderB) return 1;
        
        // If neither has order number, sort by creation date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      console.log('📋 Selected assigned order:', sortedAssignedOrders[0].order_number, sortedAssignedOrders[0].id);
      return sortedAssignedOrders[0];
    }
    
    // Strategy 5: Final fallback - sort all orders by order number
    const sortedAllOrders = orders.sort((a, b) => {
      const orderA = a.order_number || '';
      const orderB = b.order_number || '';
      
      if (orderA && orderB) {
        return orderA.localeCompare(orderB);
      }
      
      // If only one has order number, prioritize it
      if (orderA && !orderB) return -1;
      if (!orderA && orderB) return 1;
      
      // If neither has order number, sort by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    console.log('⚠️ Using final fallback - order number sorted:', sortedAllOrders[0].order_number, sortedAllOrders[0].id);
    return sortedAllOrders[0];
    
  } catch (error) {
    console.error('❌ Error in selectBestOrderToCall:', error);
    return orders[0]; // Fallback
  }
}

/**
 * Get time slot priority for sorting (lower number = earlier priority)
 */
function getTimeSlotPriority(timeSlot: string): number {
  if (!timeSlot) return 999; // No time slot = lowest priority
  
  const timeSlotMap: { [key: string]: number } = {
    'morning': 1,
    'afternoon': 2,
    'evening': 3,
    'night': 4,
    '9am-12pm': 1,
    '12pm-3pm': 2,
    '3pm-6pm': 3,
    '6pm-9pm': 4,
    '9pm-12am': 5
  };
  
  const lowerTimeSlot = timeSlot.toLowerCase();
  return timeSlotMap[lowerTimeSlot] || 999;
}

/**
 * Find active order by customer phone number
 */
async function findActiveOrderByCustomerPhone(customerPhone: string) {
  try {
    console.log('🔍 Searching for active order with customer phone:', customerPhone);
    
    // Generate multiple phone number formats
    const phoneFormats = generatePhoneFormats(customerPhone);
    
    console.log('📞 Trying customer phone formats:', phoneFormats);
    
    // Try each phone format until we find an order
    for (const format of phoneFormats) {
      console.log(`🔍 Trying customer phone format: ${format}`);
      
      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select(`
          id,
          partner_id,
          mobile_number,
          customer_name,
          status,
          partner_completion_status
        `)
        .eq('mobile_number', format)
        .in('status', ['assigned', 'in-progress'])
        .neq('partner_completion_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.log(`❌ Error with customer phone format ${format}:`, error.message);
        continue;
      }
      
      if (orders && orders.length > 0) {
        const order = orders[0];
        console.log(`✅ Found active order with customer phone format ${format}:`, order.id);
        
        // Get partner details
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('partners')
          .select('id, mobile, name, status')
      .eq('id', order.partner_id)
          .eq('status', 'Active')
      .single();

    if (partnerError || !partner) {
      console.error('Error finding partner or partner not active:', partnerError);
          continue; // Try next format
    }
    
    return {
      id: order.id,
      partner_id: order.partner_id,
          partner_phone: partner.mobile,
      partner_name: partner.name,
      customer_name: order.customer_name,
      status: order.status
    };
      }
    }
    
    console.log('❌ No active order found for any customer phone format');
    return null;
    
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
    console.log('🔍 Searching for recent order with customer phone:', customerPhone);
    
    // Generate multiple phone number formats
    const phoneFormats = generatePhoneFormats(customerPhone);
    
    console.log('📞 Trying customer phone formats:', phoneFormats);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Try each phone format until we find a recent order
    for (const format of phoneFormats) {
      console.log(`🔍 Trying recent order customer phone format: ${format}`);
      
      const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        partner_id,
        mobile_number,
        customer_name,
        status,
        created_at
      `)
        .eq('mobile_number', format)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
        .limit(1);
    
    if (error) {
        console.log(`❌ Error with recent order customer phone format ${format}:`, error.message);
        continue;
      }
      
      if (orders && orders.length > 0) {
        const order = orders[0];
        console.log(`✅ Found recent order with customer phone format ${format}:`, order.id);
        
        // Get partner details
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('partners')
          .select('id, mobile, name, status')
      .eq('id', order.partner_id)
          .eq('status', 'Active')
      .single();

    if (partnerError || !partner) {
      console.error('Error finding partner or partner not active:', partnerError);
          continue; // Try next format
    }
    
    return {
      id: order.id,
      partner_id: order.partner_id,
          partner_phone: partner.mobile,
      partner_name: partner.name,
      customer_name: order.customer_name,
      status: order.status,
      created_at: order.created_at
    };
      }
    }
    
    console.log('❌ No recent order found for any customer phone format');
    return null;
    
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
    console.log('🔍 Searching for any order with customer phone:', customerPhone);
    
    // Generate multiple phone number formats
    const phoneFormats = generatePhoneFormats(customerPhone);
    
    console.log('📞 Trying customer phone formats:', phoneFormats);
    
    // Try each phone format until we find any order
    for (const format of phoneFormats) {
      console.log(`🔍 Trying any order customer phone format: ${format}`);
      
      const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        partner_id,
        mobile_number,
        customer_name,
        status,
        created_at
      `)
        .eq('mobile_number', format)
      .order('created_at', { ascending: false })
        .limit(1);
    
    if (error) {
        console.log(`❌ Error with any order customer phone format ${format}:`, error.message);
        continue;
      }
      
      if (orders && orders.length > 0) {
        const order = orders[0];
        console.log(`✅ Found any order with customer phone format ${format}:`, order.id);
        
        // Get partner details
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('partners')
          .select('id, mobile, name, status')
      .eq('id', order.partner_id)
          .eq('status', 'Active')
      .single();

    if (partnerError || !partner) {
      console.error('Error finding partner or partner not active:', partnerError);
          continue; // Try next format
    }
    
    return {
      id: order.id,
      partner_id: order.partner_id,
          partner_phone: partner.mobile,
      partner_name: partner.name,
      customer_name: order.customer_name,
      status: order.status,
      created_at: order.created_at
    };
      }
    }
    
    console.log('❌ No order found for any customer phone format');
    return null;
    
  } catch (error) {
    console.error('Error finding any order:', error);
    return null;
  }
}

/**
 * Update call log with destination information
 */
async function updateCallLogWithDestination(callId: string, destinationInfo: {
  partner_phone: string;
  partner_id: number;
  order_id: string;
  customer_phone: string;
}) {
  try {
    const { error } = await supabaseAdmin
      .from('call_logs')
      .update({
        called_number: destinationInfo.customer_phone, // Update called_number to customer's phone
        partner_id: destinationInfo.partner_id,
        order_id: destinationInfo.order_id,
        transfer_destination: destinationInfo.customer_phone, // Transfer to customer
        transfer_type: 'number',
        updated_at: new Date().toISOString()
      })
      .eq('call_id', callId);
    
    if (error) {
      console.error('❌ Error updating call log:', error);
    } else {
      console.log('✅ Call log updated with destination:', callId);
    }
  } catch (error) {
    console.error('❌ Error in updateCallLogWithDestination:', error);
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
  call_type: string;
  partner_id?: number;
  order_id?: string;
}) {
  try {
    const { error } = await supabaseAdmin
      .from('call_logs')
      .insert({
        call_id: callData.call_id,
        uuid: callData.uuid,
        caller_number: callData.caller_number,
        called_number: callData.called_number,
        call_type: callData.call_type,
        status: callData.status,
        start_time: callData.start_time,
        partner_id: callData.partner_id || undefined,
        order_id: callData.order_id || undefined,
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
