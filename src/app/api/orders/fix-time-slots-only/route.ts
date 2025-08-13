import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get all orders with numeric time_slot values
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
        message: 'No orders found',
        updatedCount: 0
      });
    }

    // Filter orders with numeric time_slot values
    const ordersWithNumericTimeSlots = orders.filter(order => 
      order.time_slot && /^\d+$/.test(order.time_slot)
    );

    if (ordersWithNumericTimeSlots.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orders with numeric time_slot found',
        updatedCount: 0
      });
    }

    let updatedCount = 0;
    let errors = 0;
    let skippedCount = 0;

    // Process each order to extract time from title
    for (const order of ordersWithNumericTimeSlots) {
      try {
        // Extract time from title: "Time :6:00PM - 8:00PM" or similar patterns
        // Handle both "Time :6:00PM" and "Time : 6:00PM" formats
        const timeMatch = order.title.match(/Time\s*:\s*([^,]+?)(?=,|Order Total|$)/i);
        
        if (timeMatch) {
          const extractedTime = timeMatch[1].trim();
          
                      // Only update if we actually extracted meaningful time data
            if (extractedTime && extractedTime.length > 0 && !extractedTime.match(/^\s*$/)) {
              // Update ONLY the time_slot field
              const { error: updateError } = await supabase
                .from('orders')
                .update({ time_slot: extractedTime })
                .eq('id', order.id);

              if (updateError) {
                console.error(`Error updating order ${order.bitrix24_id}:`, updateError);
                errors++;
              } else {
                updatedCount++;
              }
            } else {
              skippedCount++;
            }
          } else {
            skippedCount++;
          }
      } catch (error) {
        console.error(`Error processing order ${order.bitrix24_id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Time slot fix completed. Updated: ${updatedCount}, Skipped: ${skippedCount}, Errors: ${errors}`,
      updatedCount,
      skippedCount,
      errorCount: errors,
      totalOrders: orders.length,
      ordersWithNumericTimeSlots: ordersWithNumericTimeSlots.length
    });

  } catch (error) {
    console.error('Error in fix-time-slots-only API:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fix time slots', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
