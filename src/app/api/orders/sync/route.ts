import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/orderService";

export async function POST(request: NextRequest) {
  try {
    console.log("Starting Bitrix24 sync for recent orders...");
    
    // Test database connection first
    try {
      const { supabase } = await import("@/lib/supabase");
      
      // Test basic connection
      const { data: connectionTest, error: connectionError } = await supabase.from('orders').select('count').limit(1);
      if (connectionError) {
        console.error("Database connection error:", connectionError);
        
        // Check if it's a table not found error
        if (connectionError.message.includes("relation") && connectionError.message.includes("does not exist")) {
          throw new Error("Orders table does not exist. Please run the database schema in Supabase.");
        }
        
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }
      console.log("Database connection successful");
      
      // Test table structure
      const { data: tableInfo, error: tableError } = await supabase
        .from('orders')
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error("Table structure error:", tableError);
        throw new Error(`Orders table structure issue: ${tableError.message}`);
      }
      
      console.log("Orders table structure check passed");
      console.log("Sample table data:", tableInfo);
      
    } catch (dbError) {
      console.error("Database test failed:", dbError);
      throw new Error("Database connection failed - please check if orders table exists");
    }
    
    // Debug environment variables
    console.log("Environment check:");
    console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET");
    console.log("BITRIX24_BASE_URL:", process.env.NEXT_PUBLIC_BITRIX24_BASE_URL ? "SET" : "NOT SET");
    console.log("BITRIX24_REST_URL:", process.env.NEXT_PUBLIC_BITRIX24_REST_URL ? "SET" : "NOT SET");
    
    const result = await orderService.syncRecentOrdersFromBitrix24();
    
    console.log("Recent orders sync completed:", result);
    
    // Determine the message based on the result
    let message = "Recent orders synced successfully from Bitrix24";
    if (result.created > 0 && result.updated === 0) {
      message = `Successfully created ${result.created} new orders from Bitrix24`;
    } else if (result.updated > 0 && result.created === 0) {
      message = `Successfully updated ${result.updated} existing orders from Bitrix24`;
    } else if (result.created > 0 && result.updated > 0) {
      message = `Successfully synced orders: ${result.created} created, ${result.updated} updated`;
    } else if (result.created === 0 && result.updated === 0) {
      message = "No new orders found in Bitrix24 (using stage filters)";
    }
    
    if (result.errors > 0) {
      message += ` (${result.errors} errors occurred)`;
    }
    
    return NextResponse.json({
      success: true,
      message,
      data: result
    });
    
  } catch (error) {
    console.error("Error syncing recent orders:", error);
    
    // Provide a more user-friendly error message
    let errorMessage = "Failed to sync recent orders from Bitrix24";
    if (error instanceof Error) {
      if (error.message.includes("400 Bad Request")) {
        errorMessage = "Bitrix24 API configuration issue - using fallback method";
      } else if (error.message.includes("network")) {
        errorMessage = "Network error connecting to Bitrix24";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timeout - Bitrix24 server may be slow";
      } else if (error.message.includes("supabaseUrl is required")) {
        errorMessage = "Supabase configuration issue - check environment variables";
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await orderService.getOrderStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error("Error fetching order stats:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch order statistics",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
