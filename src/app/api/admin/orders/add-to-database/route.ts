import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface ExistingOrderData {
  id: string;
  title?: string;
  amount?: number;
  customer_name?: string;
  mobile_number?: string;
  address?: string;
  city?: string;
  pin_code?: string;
  service_date?: string;
  time_slot?: string;
  service_type?: string;
  status?: string;
  commission_percentage?: string;
  advance_amount?: string;
  taxes_and_fees?: string;
  vendor_amount?: string;
  [key: string]: string | number | undefined; // Allow dynamic property access
}

interface NewOrderDetails {
  title?: string;
  amount?: number;
  customerName?: string;
  customerPhone?: string;
  address?: string;
  city?: string;
  pinCode?: string;
  serviceDate?: string;
  timeSlot?: string;
  serviceType?: string;
  status?: string;
  commission?: string;
  advanceAmount?: number;
  taxesAndFees?: string;
  vendorAmount?: string;
  [key: string]: string | number | undefined; // Allow dynamic property access
}

/**
 * Compare existing order data with new data from Bitrix24
 */
function compareOrderData(existingOrder: ExistingOrderData, newOrderDetails: NewOrderDetails): { hasChanges: boolean; changes: string[] } {
  const changes: string[] = [];
  
  // Compare key fields that might change in Bitrix24
  const fieldsToCompare = [
    { dbField: 'title', newField: 'title', name: 'Title' },
    { dbField: 'amount', newField: 'amount', name: 'Amount' },
    { dbField: 'customer_name', newField: 'customerName', name: 'Customer Name' },
    { dbField: 'mobile_number', newField: 'customerPhone', name: 'Mobile Number' },
    { dbField: 'address', newField: 'address', name: 'Address' },
    { dbField: 'city', newField: 'city', name: 'City' },
    { dbField: 'pin_code', newField: 'pinCode', name: 'PIN Code' },
    { dbField: 'service_date', newField: 'serviceDate', name: 'Service Date' },
    { dbField: 'time_slot', newField: 'timeSlot', name: 'Time Slot' },
    { dbField: 'service_type', newField: 'serviceType', name: 'Service Type' },
    { dbField: 'status', newField: 'status', name: 'Status' },
    { dbField: 'commission_percentage', newField: 'commission', name: 'Commission' },
    { dbField: 'advance_amount', newField: 'advanceAmount', name: 'Advance Amount', transform: (val: string | number | undefined) => val?.toString() },
    { dbField: 'taxes_and_fees', newField: 'taxesAndFees', name: 'Taxes and Fees' },
    { dbField: 'vendor_amount', newField: 'vendorAmount', name: 'Vendor Amount' }
  ];

  fieldsToCompare.forEach(({ dbField, newField, name, transform }) => {
    const existingValue = existingOrder[dbField];
    let newValue = newOrderDetails[newField];
    
    // Apply transformation if provided
    if (transform) {
      newValue = transform(newValue);
    }
    
    // Normalize values for comparison (handle null/undefined)
    const normalizedExisting = existingValue === null || existingValue === undefined ? '' : String(existingValue);
    const normalizedNew = newValue === null || newValue === undefined ? '' : String(newValue);
    
    if (normalizedExisting !== normalizedNew) {
      changes.push(`${name}: "${normalizedExisting}" → "${normalizedNew}"`);
    }
  });

  return {
    hasChanges: changes.length > 0,
    changes
  };
}

interface AddToDatabaseRequest {
  orderDetails: {
    id: string;
    orderNumber: string;
    title: string;
    amount: number;
    customerName: string;
    customerPhone: string;
    address: string;
    city: string;
    pinCode: string;
    serviceDate: string;
    timeSlot: string;
    package: string;
    partner: string;
    status: string;
    commission: string;
    advanceAmount: number;
    vendorAmount?: string; // Add vendor amount field
    taxesAndFees: string;
    serviceType: string;
    mode: string;
    specification: string;
    currency: string;
    bitrix24Id: string;
    stageId: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Add-to-database API called');
    
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      console.log('❌ Authentication failed:', authResult.error);
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    console.log('✅ Authentication successful');
    
    const requestBody = await request.json();
    console.log('📥 Request body received:', {
      hasOrderDetails: !!requestBody.orderDetails,
      orderNumber: requestBody.orderDetails?.orderNumber,
      bitrix24Id: requestBody.orderDetails?.bitrix24Id
    });

    const { orderDetails }: AddToDatabaseRequest = requestBody;

    if (!orderDetails || !orderDetails.orderNumber) {
      return NextResponse.json(
        { error: 'Order details are required' },
        { status: 400 }
      );
    }

    console.log(`📥 Admin adding order ${orderDetails.orderNumber} to database`);
    console.log(`🔍 Order details:`, {
      bitrix24Id: orderDetails.bitrix24Id,
      orderNumber: orderDetails.orderNumber,
      customerName: orderDetails.customerName,
      amount: orderDetails.amount
    });

    // Check if order already exists in database by bitrix24_id
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('*')
      .eq('bitrix24_id', orderDetails.bitrix24Id)
      .single();

    // Also check by order_number as fallback
    const { data: existingOrderByNumber, error: checkByNumberError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderDetails.orderNumber)
      .single();

    // Handle the case where no record is found (checkError exists but existingOrder is null)
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new orders
      console.error('Error checking existing order by bitrix24_id:', checkError);
      return NextResponse.json(
        { 
          error: 'Failed to check existing order', 
          details: checkError.message 
        },
        { status: 500 }
      );
    }

    if (checkByNumberError && checkByNumberError.code !== 'PGRST116') {
      console.error('Error checking existing order by order_number:', checkByNumberError);
      return NextResponse.json(
        { 
          error: 'Failed to check existing order by number', 
          details: checkByNumberError.message 
        },
        { status: 500 }
      );
    }

    // Use whichever existing order we found
    const finalExistingOrder = existingOrder || existingOrderByNumber;

    console.log(`🔍 Existing order check result:`, {
      existingByBitrixId: existingOrder ? 'Found' : 'Not found',
      existingByOrderNumber: existingOrderByNumber ? 'Found' : 'Not found',
      finalExistingOrder: finalExistingOrder ? 'Found' : 'Not found',
      checkError: checkError ? checkError.code : 'None',
      bitrix24Id: orderDetails.bitrix24Id,
      orderNumber: orderDetails.orderNumber
    });

    if (finalExistingOrder) {
      console.log(`🔄 Order ${orderDetails.orderNumber} already exists in database with ID: ${finalExistingOrder.id}`);
      
      // Compare existing data with new data from Bitrix24
      const hasChanges = compareOrderData(finalExistingOrder, orderDetails);
      
      if (hasChanges.hasChanges) {
        console.log(`📝 Order ${orderDetails.orderNumber} has updates from Bitrix24:`, hasChanges.changes);
        
        // Update the order with new data from Bitrix24
        const updateData = {
          title: orderDetails.title,
          amount: orderDetails.amount,
          customer_name: orderDetails.customerName,
          mobile_number: orderDetails.customerPhone,
          address: orderDetails.address,
          city: orderDetails.city,
          pin_code: orderDetails.pinCode,
          service_date: orderDetails.serviceDate,
          time_slot: orderDetails.timeSlot,
          service_type: orderDetails.serviceType,
          status: orderDetails.status,
          commission_percentage: orderDetails.commission,
          advance_amount: orderDetails.advanceAmount?.toString(),
          taxes_and_fees: orderDetails.taxesAndFees,
          vendor_amount: orderDetails.vendorAmount || '',
          updated_at: new Date().toISOString()
        };

        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', existingOrder.id)
          .select('id, order_number, title, status')
          .single();

        if (updateError) {
          console.error('Error updating existing order:', updateError);
          return NextResponse.json(
            { 
              error: 'Failed to update existing order',
              details: updateError.message 
            },
            { status: 500 }
          );
        }

        console.log(`✅ Order ${orderDetails.orderNumber} successfully updated with latest Bitrix24 data`);
        return NextResponse.json({
          success: true,
          message: `Order ${orderDetails.orderNumber} updated with latest data from Bitrix24`,
          order: {
            id: updatedOrder.id,
            orderNumber: updatedOrder.order_number,
            title: updatedOrder.title,
            status: updatedOrder.status,
            bitrix24Id: orderDetails.bitrix24Id
          },
          notice: `Order updated with changes: ${hasChanges.changes.join(', ')}. Ready for partner assignment.`,
          changes: hasChanges.changes
        });
      } else {
        console.log(`✅ Order ${orderDetails.orderNumber} is up to date - no changes detected`);
        return NextResponse.json({
          success: true,
          message: `Order ${orderDetails.orderNumber} is already up to date`,
          order: {
            id: existingOrder.id,
            orderNumber: orderDetails.orderNumber,
            status: 'up_to_date',
            message: 'Order data is current'
          },
          notice: 'Order data is already synchronized with Bitrix24. Ready for partner assignment.'
        });
      }
    }

    // Prepare order data for database insertion
    const orderData = {
      bitrix24_id: orderDetails.bitrix24Id,
      title: orderDetails.title,
      
      // Parsed Order Fields
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
      
      // Financial Fields
      commission_percentage: orderDetails.commission || '',
      advance_amount: orderDetails.advanceAmount?.toString() || '',
      taxes_and_fees: orderDetails.taxesAndFees || '',
      vendor_amount: orderDetails.vendorAmount || '',
      service_date: orderDetails.serviceDate || '',
      time_slot: orderDetails.timeSlot || '',
      
      // Original Order Fields
      service_type: orderDetails.serviceType || orderDetails.package || 'Unknown Service',
      specification: orderDetails.specification || orderDetails.package || '',
      stage_id: orderDetails.stageId || '',
      status: orderDetails.status || 'pending',
      currency: orderDetails.currency || 'INR',
      amount: orderDetails.amount || 0,
      
      // Partner assignment (null for database-only orders)
      partner_id: null,
      
      // Dates
      date_created: orderDetails.serviceDate ? new Date(orderDetails.serviceDate) : new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert order into database
    console.log(`💾 Inserting new order ${orderDetails.orderNumber} into database...`);
    console.log(`📊 Order data to insert:`, {
      bitrix24_id: orderData.bitrix24_id,
      order_number: orderData.order_number,
      customer_name: orderData.customer_name,
      amount: orderData.amount,
      status: orderData.status
    });
    
    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id, bitrix24_id, order_number, title, status')
      .single();

    if (insertError) {
      console.error('❌ Error inserting order to database:', insertError);
      console.error('❌ Insert error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        orderNumber: orderDetails.orderNumber,
        bitrix24Id: orderDetails.bitrix24Id
      });
      
      // Handle specific error cases
      if (insertError.code === '23505') {
        // Unique constraint violation
        console.error('❌ Unique constraint violation - order with this bitrix24_id already exists');
        return NextResponse.json(
          { 
            error: 'Order already exists in database', 
            details: `An order with Bitrix24 ID ${orderDetails.bitrix24Id} already exists`,
            code: insertError.code,
            hint: 'This order may have been added previously'
          },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to save order to database', 
          details: insertError.message,
          code: insertError.code,
          hint: insertError.hint
        },
        { status: 500 }
      );
    }

    console.log(`✅ Order ${orderDetails.orderNumber} successfully saved to database with ID: ${newOrder.id}`);

    return NextResponse.json({
      success: true,
      message: 'Order successfully added to database',
      order: {
        id: newOrder.id,
        orderNumber: newOrder.order_number,
        title: newOrder.title,
        status: newOrder.status,
        bitrix24Id: newOrder.bitrix24_id
      },
      notice: 'Order saved without partner assignment. You can assign a partner later.'
    });

  } catch (error) {
    console.error('Admin add to database error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
