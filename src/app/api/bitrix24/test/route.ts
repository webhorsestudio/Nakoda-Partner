import { NextRequest, NextResponse } from "next/server";
import { bitrix24Service } from "@/services/bitrix24Service";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing Bitrix24 API connection...");
    
    // Fetch first 10 deals to test the connection
    const response = await bitrix24Service.fetchDeals(0, 10);
    
    console.log("Bitrix24 API Response:", {
      total: response.total,
      fetched: response.result.length,
      firstDeal: response.result[0] ? {
        ID: response.result[0].ID,
        TITLE: response.result[0].TITLE,
        STAGE_ID: response.result[0].STAGE_ID,
        DATE_CREATE: response.result[0].DATE_CREATE,
        DATE_MODIFY: response.result[0].DATE_MODIFY
      } : null
    });
    
    return NextResponse.json({
      success: true,
      message: "Bitrix24 API connection successful",
      data: {
        total: response.total,
        fetched: response.result.length,
        deals: response.result.slice(0, 3), // Return first 3 deals for inspection
        time: response.time
      }
    });
    
  } catch (error) {
    console.error("Error testing Bitrix24 API:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to connect to Bitrix24 API",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
