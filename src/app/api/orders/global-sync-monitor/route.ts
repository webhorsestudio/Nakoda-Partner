import { NextRequest, NextResponse } from 'next/server';
import { globalOrderFetcher } from '@/services/globalOrderFetcher';

/**
 * POST /api/orders/global-sync-monitor
 * Enhanced monitoring endpoint for cron jobs and external services
 * Provides detailed logging and status information
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`🌍 Global Sync Monitor: Starting sync at ${timestamp}`);
    
    // Get user agent to identify the caller
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const callerIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'Unknown';
    
    console.log(`🌍 Global Sync Monitor: Called by ${userAgent} from ${callerIP}`);
    
    // Force a sync using the global fetcher
    const result = await globalOrderFetcher.forceSync();
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Global Sync Monitor: Sync completed in ${duration}ms`, result);
    
    // Enhanced response with monitoring data
    return NextResponse.json({
      success: true,
      message: 'Global sync completed successfully',
      data: result,
      monitoring: {
        timestamp,
        duration: `${duration}ms`,
        caller: {
          userAgent,
          ip: callerIP
        },
        server: {
          nodeVersion: process.version,
          platform: process.platform,
          uptime: `${Math.floor(process.uptime())}s`
        }
      }
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`❌ Global Sync Monitor: Sync failed after ${duration}ms`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Global sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        monitoring: {
          timestamp,
          duration: `${duration}ms`,
          error: true
        }
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/global-sync-monitor
 * Get detailed status and health information
 */
export async function GET() {
  try {
    const status = globalOrderFetcher.getStatus();
    const stats = await globalOrderFetcher.getSyncStats();
    
    return NextResponse.json({
      success: true,
      data: {
        status,
        stats,
        health: {
          timestamp: new Date().toISOString(),
          server: {
            nodeVersion: process.version,
            platform: process.platform,
            uptime: `${Math.floor(process.uptime())}s`,
            memoryUsage: process.memoryUsage()
          },
          database: {
            // Add database health check here if needed
            status: 'connected'
          }
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Global Sync Monitor: Failed to get status', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get global sync status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
