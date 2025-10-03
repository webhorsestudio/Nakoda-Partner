import { NextResponse } from "next/server";
import { globalOrderFetcher } from "@/services/globalOrderFetcher";

/**
 * POST /api/orders/global-sync
 * Global order synchronization endpoint that runs independently of user authentication
 * This endpoint is called by the service worker for 24/7 operation
 */
export async function POST() {
  const startTime = Date.now();
  
  try {
    console.log('🌍 Global Sync API: Starting global order sync...');
    
    // Ensure the global fetcher is running (auto-start if needed)
    const status = globalOrderFetcher.getStatus();
    if (!status.isRunning) {
      console.log('🔄 Global Sync API: Service not running, starting it...');
      try {
        await globalOrderFetcher.start();
        console.log('✅ Global Sync API: Service started successfully');
      } catch (startError) {
        console.warn('⚠️ Global Sync API: Failed to start service, continuing with manual sync');
      }
    }
    
    // Force a sync using the global fetcher with timeout protection
    const syncPromise = globalOrderFetcher.forceSync();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Sync timeout after 50 seconds')), 50000)
    );
    
    const result = await Promise.race([syncPromise, timeoutPromise]);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Global Sync API: Sync completed in ${duration}ms`, result);
    
    return NextResponse.json({
      success: true,
      message: 'Global sync completed successfully',
      data: result,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Global Sync API: Sync failed after ${duration}ms`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Global sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/global-sync
 * Get the status of the global order fetcher and optionally trigger sync
 * This endpoint is called by UptimeRobot free account (default GET requests)
 */
export async function GET() {
  const startTime = Date.now();
  
  try {
    console.log('🌍 Global Sync API: GET request received (UptimeRobot monitoring)');
    
    // Ensure the global fetcher is running (auto-start if needed)
    const status = globalOrderFetcher.getStatus();
    if (!status.isRunning) {
      console.log('🔄 Global Sync API: Service not running, starting it...');
      try {
        await globalOrderFetcher.start();
        console.log('✅ Global Sync API: Service started successfully');
      } catch (startError) {
        console.warn('⚠️ Global Sync API: Failed to start service, continuing with manual sync');
      }
    }
    
    // Get updated status
    const updatedStatus = globalOrderFetcher.getStatus();
    const stats = await globalOrderFetcher.getSyncStats();
    
    // For UptimeRobot monitoring, trigger sync with timeout protection
    const syncPromise = globalOrderFetcher.forceSync();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Sync timeout after 45 seconds')), 45000)
    );
    
    let result;
    try {
      result = await Promise.race([syncPromise, timeoutPromise]);
    } catch (timeoutError) {
      console.warn('⚠️ Global Sync API: Sync timed out, returning status only');
      // Return status even if sync times out
      return NextResponse.json({
        success: true,
        message: 'Global sync status retrieved (sync timed out)',
        data: {
          status: updatedStatus,
          stats,
          syncResult: null,
          timeout: true,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Global Sync API: GET sync completed in ${duration}ms`, result);
    
    return NextResponse.json({
      success: true,
      message: 'Global sync completed successfully',
      data: {
        status: updatedStatus,
        stats,
        syncResult: result,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Global Sync API: GET request failed after ${duration}ms`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Global sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
