import { NextResponse } from "next/server";
import { globalOrderFetcher } from "@/services/globalOrderFetcher";

export async function GET() {
  try {
    console.log('🔧 Manual Global Sync Service Test...');
    
    // Get current status
    const currentStatus = globalOrderFetcher.getStatus();
    console.log('📊 Current status:', currentStatus);
    
    // Try to start the service
    console.log('🚀 Attempting to start Global Order Fetcher...');
    await globalOrderFetcher.start();
    
    // Get updated status
    const updatedStatus = globalOrderFetcher.getStatus();
    console.log('📈 Updated status:', updatedStatus);
    
    // Try a manual sync
    console.log('🔄 Attempting manual sync...');
    const syncResult = await globalOrderFetcher.forceSync();
    console.log('✅ Sync result:', syncResult);
    
    return NextResponse.json({
      success: true,
      message: 'Global Sync service test completed',
      data: {
        initialStatus: currentStatus,
        finalStatus: updatedStatus,
        syncResult,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Global Sync service test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Global Sync service test failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
