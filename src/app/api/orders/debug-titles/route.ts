import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    console.log("Debug endpoint called - fetching order data...");
    
    // Fetch actual order data with titles
    const { data, error } = await supabase
      .from("orders")
      .select("bitrix24_id, title, address, city, pin_code, mode, package, customer_name, mobile_number, order_number, order_date, order_time")
      .limit(10);

    console.log("Query result:", { data, error });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({
        success: false,
        error: "Database query failed",
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }

    // Format the response for better readability
    const formattedData = data?.map(order => ({
      bitrix24_id: order.bitrix24_id,
      title: order.title,
      parsed_fields: {
        mode: order.mode || 'N/A',
        package: order.package || 'N/A',
        order_number: order.order_number || 'N/A',
        mobile_number: order.mobile_number || 'N/A',
        order_date: order.order_date || 'N/A',
        order_time: order.order_time || 'N/A',
        customer_name: order.customer_name || 'N/A',
        address: order.address || 'N/A',
        city: order.city || 'N/A',
        pin_code: order.pin_code || 'N/A'
      }
    }));

    return NextResponse.json({
      success: true,
      message: "Order data fetched successfully",
      data: formattedData,
      count: data?.length || 0
    });

  } catch (error) {
    console.error("Unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
