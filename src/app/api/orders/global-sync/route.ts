import { NextResponse } from "next/server";
import { globalOrderFetcher } from "@/services/globalOrderFetcher";

/**
 * POST /api/orders/global-sync
 * Global order synchronization endpoint that runs independently of user authentication
 * This endpoint is called by the service worker for 24/7 operation
 */
export async function POST() {
  try {
    console.log('🌍 Global Sync API: Starting global order sync...');
    
    // Force a sync using the global fetcher
    const result = await globalOrderFetcher.forceSync();
    
    console.log('✅ Global Sync API: Sync completed', result);
    
    return NextResponse.json({
      success: true,
      message: 'Global sync completed successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Global Sync API: Sync failed', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Global sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
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
  try {
    console.log('🌍 Global Sync API: GET request received (UptimeRobot monitoring)');
    
    // Get current status
    const status = globalOrderFetcher.getStatus();
    const stats = await globalOrderFetcher.getSyncStats();
    
    // For UptimeRobot monitoring, we can optionally trigger a sync
    // This ensures the endpoint is actively doing something useful
    const result = await globalOrderFetcher.forceSync();
    
    console.log('✅ Global Sync API: GET sync completed', result);
    
    return NextResponse.json({
      success: true,
      message: 'Global sync completed successfully',
      data: {
        status,
        stats,
        syncResult: result,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Global Sync API: GET request failed', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Global sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
