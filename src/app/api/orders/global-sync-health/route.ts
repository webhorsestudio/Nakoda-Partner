import { NextResponse } from "next/server";
import { globalOrderFetcher } from "@/services/globalOrderFetcher";

/**
 * GET /api/orders/global-sync-health
 * Simple health check endpoint for UptimeRobot monitoring
 * Returns status without triggering full sync
 */
export async function GET() {
  try {
    console.log('🏥 Health Check: Checking global sync status...');
    
    // Get current status (fast operation)
    const status = globalOrderFetcher.getStatus();
    const stats = await globalOrderFetcher.getSyncStats();
    
    return NextResponse.json({
      success: true,
      message: 'Global sync service is healthy',
      data: {
        status,
        stats,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Health Check: Failed', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
