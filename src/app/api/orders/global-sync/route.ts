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
        console.warn('⚠️ Global Sync API: Failed to start service, continuing with manual sync', startError);
      }
    }
    
    // Force a sync using the global fetcher with aggressive timeout protection
    const syncPromise = globalOrderFetcher.forceSync();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Sync timeout after 60 seconds')), 60000)
    );
    
    let result;
    try {
      result = await Promise.race([syncPromise, timeoutPromise]);
    } catch (timeoutError) {
      console.warn('⚠️ Global Sync API: POST sync timed out, running in background', timeoutError);
      
      // Start background sync without waiting
      syncPromise.then(bgResult => {
        console.log('✅ Global Sync API: Background POST sync completed', bgResult);
      }).catch(bgError => {
        console.error('❌ Global Sync API: Background POST sync failed', bgError);
      });
      
      // Return success even if sync times out
      const duration = Date.now() - startTime;
      return NextResponse.json({
        success: true,
        message: 'Global sync initiated (running in background)',
        data: {
          backgroundSync: true,
          timeout: true
        },
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    }
    
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
        console.warn('⚠️ Global Sync API: Failed to start service, continuing with manual sync', startError);
      }
    }
    
    // Get updated status
    const updatedStatus = globalOrderFetcher.getStatus();
    const stats = await globalOrderFetcher.getSyncStats();
    
    // For UptimeRobot monitoring, trigger sync with aggressive timeout protection
    const syncPromise = globalOrderFetcher.forceSync();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Sync timeout after 60 seconds')), 60000)
    );
    
    let result;
    try {
      result = await Promise.race([syncPromise, timeoutPromise]);
    } catch (timeoutError) {
      console.warn('⚠️ Global Sync API: Sync timed out, returning status only', timeoutError);
      
      // Start background sync without waiting
      syncPromise.then(bgResult => {
        console.log('✅ Global Sync API: Background sync completed after timeout', bgResult);
      }).catch(bgError => {
        console.error('❌ Global Sync API: Background sync failed after timeout', bgError);
      });
      
      // Return status even if sync times out
      return NextResponse.json({
        success: true,
        message: 'Global sync status retrieved (sync timed out, running in background)',
        data: {
          status: updatedStatus,
          stats,
          syncResult: null,
          timeout: true,
          backgroundSync: true,
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
