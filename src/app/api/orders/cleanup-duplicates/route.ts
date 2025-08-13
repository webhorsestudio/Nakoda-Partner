import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services/orderService';

export async function POST(request: NextRequest) {
  try {
    const result = await orderService.cleanupDuplicateBitrix24Ids();
    
    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${result.removed} duplicate orders`,
      data: result
    });
    
  } catch (error) {
    console.error("Error cleaning up duplicate orders:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to clean up duplicate orders",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Just return info about the cleanup endpoint
    return NextResponse.json({
      success: true,
      message: "Duplicate cleanup endpoint",
      usage: "POST to this endpoint to clean up duplicate bitrix24_id entries"
    });
    
  } catch (error) {
    console.error("Error in duplicate cleanup endpoint:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Endpoint error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
