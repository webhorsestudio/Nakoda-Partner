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
    
    // Ensure the global fetcher is running (auto-start if needed)
    const status = globalOrderFetcher.getStatus();
    if (!status.isRunning) {
      console.log('🔄 Health Check: Service not running, starting it...');
      try {
        await globalOrderFetcher.start();
        console.log('✅ Health Check: Service started successfully');
      } catch (startError) {
        console.warn('⚠️ Health Check: Failed to start service', startError);
      }
    }
    
    // Get updated status (fast operation)
    const updatedStatus = globalOrderFetcher.getStatus();
    const stats = await globalOrderFetcher.getSyncStats();
    
    return NextResponse.json({
      success: true,
      message: 'Global sync service is healthy',
      data: {
        status: updatedStatus,
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
