import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get all orders from the database
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, bitrix24_id, title, time_slot');

    if (fetchError) {
      console.error('Error fetching orders:', fetchError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch orders', error: fetchError.message },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orders found to update',
        updatedCount: 0
      });
    }

    let updatedCount = 0;
    let errors = 0;

    // Process each order to extract time from title
    for (const order of orders) {
      try {
        let newTimeSlot = order.time_slot;

        // Only update if the current time_slot is numeric (old format)
        if (order.time_slot && /^\d+$/.test(order.time_slot) && order.title) {
          // Extract time from title: "Time :12:00PM - 2:00PM" or similar patterns
          // Look for time followed by either comma or "Order Total" or end of string
          // Handle both "Time :6:00PM" and "Time : 6:00PM" formats
          const timeMatch = order.title.match(/Time\s*:\s*([^,]+?)(?=,|Order Total|$)/i);
          if (timeMatch) {
            const extractedTime = timeMatch[1].trim();
            // Only update if we actually extracted meaningful time data
            if (extractedTime && extractedTime.length > 0 && !extractedTime.match(/^\s*$/)) {
              newTimeSlot = extractedTime;
            }
          }
        }

        // Update the order if time_slot changed
        if (newTimeSlot !== order.time_slot) {
          const { error: updateError } = await supabase
            .from('orders')
            .update({ 
              time_slot: newTimeSlot,
              order_time: newTimeSlot // Also update order_time for consistency
            })
            .eq('id', order.id);

          if (updateError) {
            console.error(`Error updating order ${order.bitrix24_id}:`, updateError);
            errors++;
          } else {
            updatedCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing order ${order.bitrix24_id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} orders with new time slot logic. ${errors} errors occurred.`,
      updatedCount,
      errorCount: errors,
      totalOrders: orders.length
    });

  } catch (error) {
    console.error('Error in update-time-slots API:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update time slots', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
