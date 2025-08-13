import { NextResponse } from "next/server";
import { orderService } from "@/services/orderService";

export async function GET() {
  try {
    const result = await orderService.getOrderStats();
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error("Error fetching order stats:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch order stats",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
