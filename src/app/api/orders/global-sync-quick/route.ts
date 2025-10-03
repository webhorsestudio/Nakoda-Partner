import { NextResponse } from "next/server";
import { globalOrderFetcher } from "@/services/globalOrderFetcher";

/**
 * GET /api/orders/global-sync-quick
 * Quick sync endpoint that returns immediately and processes in background
 * Perfect for UptimeRobot monitoring - no timeout issues
 */
export async function GET() {
  const startTime = Date.now();
  
  try {
    console.log('⚡ Quick Sync API: Starting background sync...');
    
    // Ensure the global fetcher is running (auto-start if needed)
    const status = globalOrderFetcher.getStatus();
    if (!status.isRunning) {
      console.log('🔄 Quick Sync API: Service not running, starting it...');
      try {
        await globalOrderFetcher.start();
        console.log('✅ Quick Sync API: Service started successfully');
      } catch (startError) {
        console.warn('⚠️ Quick Sync API: Failed to start service');
      }
    }
    
    // Get current status
    const updatedStatus = globalOrderFetcher.getStatus();
    const stats = await globalOrderFetcher.getSyncStats();
    
    // Trigger background sync without waiting for completion
    const syncPromise = globalOrderFetcher.forceSync();
    
    // Don't wait for sync to complete - return immediately
    syncPromise.then(result => {
      console.log('✅ Quick Sync API: Background sync completed', result);
    }).catch(error => {
      console.error('❌ Quick Sync API: Background sync failed', error);
    });
    
    const duration = Date.now() - startTime;
    console.log(`⚡ Quick Sync API: Response sent in ${duration}ms (background sync started)`);
    
    return NextResponse.json({
      success: true,
      message: 'Background sync initiated successfully',
      data: {
        status: updatedStatus,
        stats,
        backgroundSync: true,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Quick Sync API: Failed after ${duration}ms`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Quick sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
