import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const { orderDetails }: AddToDatabaseRequest = await request.json();

    if (!orderDetails || !orderDetails.orderNumber) {
      return NextResponse.json(
        { error: 'Order details are required' },
        { status: 400 }
      );
    }

    console.log(`📥 Admin adding order ${orderDetails.orderNumber} to database`);

    // Check if order already exists in database
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, bitrix24_id')
      .eq('bitrix24_id', orderDetails.bitrix24Id)
      .single();

    if (existingOrder) {
      console.log(`✅ Order ${orderDetails.orderNumber} already exists in database with ID: ${existingOrder.id}`);
      return NextResponse.json(
        {
          success: true, // Change to true since this is expected behavior
          message: `Order ${orderDetails.orderNumber} already exists in the database`,
          order: {
            id: existingOrder.id,
            orderNumber: orderDetails.orderNumber,
            status: 'already_exists',
            message: 'Order is ready for partner assignment'
          },
          notice: 'Order already exists in database. You can assign a partner to it.'
        },
        { status: 200 } // Change to 200 since this is not an error
      );
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
    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id, bitrix24_id, order_number, title, status')
      .single();

    if (insertError) {
      console.error('Error inserting order to database:', insertError);
      return NextResponse.json(
        { 
          error: 'Failed to save order to database',
          details: insertError.message 
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
