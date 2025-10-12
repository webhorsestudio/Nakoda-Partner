import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { professionalBitrix24Service } from '@/services/professionalBitrix24Service';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const { orderNumber } = await request.json();

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order Number is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Testing order ${orderNumber}...`);

    // Step 1: Fetch from Bitrix24
    console.log(`📡 Step 1: Fetching order ${orderNumber} from Bitrix24...`);
    const foundDeal = await professionalBitrix24Service.fetchDealByOrderNumber(orderNumber);

    if (!foundDeal) {
      return NextResponse.json({
        success: false,
        error: `Order ${orderNumber} not found in Bitrix24`,
        step: 'bitrix24_fetch'
      });
    }

    console.log(`✅ Step 1: Found deal ${foundDeal.ID} for order ${orderNumber}`);

    // Step 2: Transform to order details
    console.log(`🔄 Step 2: Transforming deal to order details...`);
    const orderDetails = {
      id: foundDeal.ID,
      bitrix24Id: foundDeal.ID,
      orderNumber: foundDeal.UF_CRM_1681649038953 || 'N/A',
      title: foundDeal.TITLE || 'Service Request',
      amount: parseFloat((foundDeal.UF_CRM_1681648179537 || '0|INR').split('|')[0]) || 0,
      currency: (foundDeal.UF_CRM_1681648179537 || '0|INR').split('|')[1] || 'INR',
      customerName: foundDeal.UF_CRM_1681645659170 || 'Unknown Customer',
      customerPhone: foundDeal.UF_CRM_1681974166046 || '',
      address: foundDeal.UF_CRM_1681747087033 || '',
      city: '',
      pinCode: '',
      serviceDate: foundDeal.UF_CRM_1681648036958 || '',
      timeSlot: foundDeal.UF_CRM_1681747291577 || foundDeal.UF_CRM_1681647842342 || '',
      package: (foundDeal.UF_CRM_1681749732453 || '').split(' By : ')[0] || 'Unknown Package',
      partner: (foundDeal.UF_CRM_1681749732453 || '').split(' By : ')[1] || undefined,
      status: mapStageToStatus(foundDeal.STAGE_ID),
      stageId: foundDeal.STAGE_ID,
      commission: foundDeal.UF_CRM_1681648200083 || '',
      advanceAmount: parseFloat((foundDeal.UF_CRM_1681648284105 || '0|INR').split('|')[0]) || 0,
      vendorAmount: foundDeal.UF_CRM_1681649447600 || '',
      taxesAndFees: foundDeal.UF_CRM_1723904458952 || '',
      serviceType: (foundDeal.UF_CRM_1681749732453 || '').split(' By : ')[0] || 'Unknown Service',
      mode: 'online',
      specification: foundDeal.UF_CRM_1681648220910 || '',
    };

    // Parse address components
    if (orderDetails.address) {
      const addressParts = orderDetails.address.split(',').map(part => part.trim());
      
      // Extract pin code (last numeric part)
      const pinCodeMatch = orderDetails.address.match(/(\d{6})/);
      if (pinCodeMatch) {
        orderDetails.pinCode = pinCodeMatch[1];
      }
      
      // Extract city (look for meaningful city name, not just numbers)
      for (let i = addressParts.length - 1; i >= 0; i--) {
        const part = addressParts[i].trim();
        // Skip if it's just a pin code (6 digits) or empty
        if (part.match(/^\d{6}$/) || part === '') {
          continue;
        }
        // If we find a meaningful city name, use it
        if (part.length > 2 && !part.match(/^\d+$/)) {
          orderDetails.city = part;
          break;
        }
      }
      
      // Clean up address by removing just the pin code from the end
      orderDetails.address = orderDetails.address.replace(/\s*,?\s*\d{6}\s*,?\s*$/, '').replace(/,\s*,/g, ',').trim();
    }

    console.log(`✅ Step 2: Transformed order details:`, {
      bitrix24Id: orderDetails.bitrix24Id,
      orderNumber: orderDetails.orderNumber,
      customerName: orderDetails.customerName,
      amount: orderDetails.amount,
      address: orderDetails.address,
      city: orderDetails.city,
      pinCode: orderDetails.pinCode
    });

    // Step 3: Check if order exists in database
    console.log(`🔍 Step 3: Checking if order exists in database...`);
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('*')
      .eq('bitrix24_id', orderDetails.bitrix24Id)
      .single();

    console.log(`🔍 Step 3 result:`, {
      existingOrder: existingOrder ? 'Found' : 'Not found',
      checkError: checkError ? checkError.code : 'None',
      bitrix24Id: orderDetails.bitrix24Id
    });

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Step 3: Error checking existing order:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check existing order',
        details: checkError.message,
        step: 'database_check'
      });
    }

    if (existingOrder) {
      console.log(`✅ Step 3: Order already exists with ID: ${existingOrder.id}`);
      return NextResponse.json({
        success: true,
        message: `Order ${orderNumber} already exists in database`,
        order: {
          id: existingOrder.id,
          orderNumber: existingOrder.order_number,
          bitrix24Id: existingOrder.bitrix24_id,
          status: existingOrder.status
        },
        step: 'existing_order_found'
      });
    }

    // Step 4: Prepare data for insertion
    console.log(`📝 Step 4: Preparing data for insertion...`);
    const orderData = {
      bitrix24_id: orderDetails.bitrix24Id,
      title: orderDetails.title,
      mode: orderDetails.mode || 'online',
      package: orderDetails.package || '',
      partner: orderDetails.partner || '',
      order_number: orderDetails.orderNumber,
      mobile_number: orderDetails.customerPhone || '',
      order_date: orderDetails.serviceDate ? new Date(orderDetails.serviceDate).toLocaleDateString() : null,
      order_time: orderDetails.timeSlot || '',
      customer_name: orderDetails.customerName || '',
      address: orderDetails.address || '',
      city: orderDetails.city || '',
      pin_code: orderDetails.pinCode || '',
      commission_percentage: orderDetails.commission || '',
      advance_amount: orderDetails.advanceAmount?.toString() || '',
      taxes_and_fees: orderDetails.taxesAndFees || '',
      vendor_amount: orderDetails.vendorAmount || '',
      service_date: orderDetails.serviceDate || '',
      time_slot: orderDetails.timeSlot || '',
      service_type: orderDetails.serviceType || orderDetails.package || 'Unknown Service',
      specification: orderDetails.specification || orderDetails.package || '',
      stage_id: orderDetails.stageId || '',
      status: orderDetails.status || 'pending',
      currency: orderDetails.currency || 'INR',
      amount: orderDetails.amount || 0,
      partner_id: null,
      date_created: orderDetails.serviceDate ? new Date(orderDetails.serviceDate) : new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log(`✅ Step 4: Prepared order data:`, {
      bitrix24_id: orderData.bitrix24_id,
      order_number: orderData.order_number,
      customer_name: orderData.customer_name,
      amount: orderData.amount,
      status: orderData.status
    });

    // Step 5: Insert into database
    console.log(`💾 Step 5: Inserting order into database...`);
    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id, bitrix24_id, order_number, title, status')
      .single();

    if (insertError) {
      console.error('❌ Step 5: Error inserting order:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to insert order into database',
        details: insertError.message,
        code: insertError.code,
        hint: insertError.hint,
        step: 'database_insert'
      });
    }

    console.log(`✅ Step 5: Order successfully inserted with ID: ${newOrder.id}`);

    return NextResponse.json({
      success: true,
      message: `Order ${orderNumber} successfully added to database`,
      order: {
        id: newOrder.id,
        orderNumber: newOrder.order_number,
        title: newOrder.title,
        status: newOrder.status,
        bitrix24Id: newOrder.bitrix24_id
      },
      step: 'success'
    });

  } catch (error) {
    console.error('❌ Test API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        step: 'error'
      },
      { status: 500 }
    );
  }
}

// Helper function to map Bitrix24 stage to status
function mapStageToStatus(stageId: string): string {
  switch (stageId) {
    case 'C2:PREPAYMENT_INVOICE':
      return 'pending';
    case 'C2:EXECUTING':
      return 'in_progress';
    case 'C2:FINAL_INVOICE':
      return 'completed';
    case 'C2:WON':
      return 'completed';
    case 'C2:LOSE':
      return 'cancelled';
    default:
      return 'pending';
  }
}
