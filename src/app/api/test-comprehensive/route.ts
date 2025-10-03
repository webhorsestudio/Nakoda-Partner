import { NextResponse } from "next/server";
import { bitrix24Service } from "@/services/bitrix24Service";
import { orderService } from "@/services/orderService";

export async function GET() {
  try {
    console.log('🔍 Comprehensive Bitrix24 + Order Service Test...');
    
    const testResults = {
      timestamp: new Date().toISOString(),
      tests: [] as Array<{
        test: string;
        status: 'success' | 'error' | 'warning';
        details: Record<string, unknown>;
        duration?: string;
      }>
    };
    
    // Test 1: Environment Variables
    const envCheck = {
      BITRIX24_DOMAIN: !!process.env.BITRIX24_DOMAIN,
      BITRIX24_WEBHOOK_ID: !!process.env.BITRIX24_WEBHOOK_ID,
      BITRIX24_WEBHOOK_SECRET: !!process.env.BITRIX24_WEBHOOK_SECRET,
    };
    
    testResults.tests.push({
      test: 'Environment Variables',
      status: Object.values(envCheck).every(Boolean) ? 'success' : 'error',
      details: envCheck
    });
    
    // Test 2: Bitrix24 API Connection
    try {
      console.log('📡 Testing Bitrix24 API connection...');
      const startTime = Date.now();
      
      const deals = await Promise.race([
        bitrix24Service.fetchRecentDealsWithFallback(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Bitrix24 API timeout after 30 seconds')), 30000)
        )
      ]);
      
      const duration = Date.now() - startTime;
      
      testResults.tests.push({
        test: 'Bitrix24 API Connection',
        status: 'success',
        details: {
          dealsCount: Array.isArray(deals) ? deals.length : 0,
          sampleDeal: Array.isArray(deals) && deals.length > 0 ? {
            id: deals[0].ID,
            title: deals[0].TITLE,
            stage: deals[0].STAGE_ID
          } : null
        },
        duration: `${duration}ms`
      });
      
      console.log(`✅ Bitrix24 API test successful: ${Array.isArray(deals) ? deals.length : 0} deals in ${duration}ms`);
      
    } catch (bitrixError) {
      testResults.tests.push({
        test: 'Bitrix24 API Connection',
        status: 'error',
        details: {
          error: bitrixError instanceof Error ? bitrixError.message : 'Unknown error',
          stack: bitrixError instanceof Error ? bitrixError.stack : undefined
        }
      });
      console.error('❌ Bitrix24 API test failed:', bitrixError);
    }
    
    // Test 3: Order Service Sync
    try {
      console.log('🔄 Testing Order Service sync...');
      const startTime = Date.now();
      
      const syncResult = await Promise.race([
        orderService.syncRecentOrdersFromBitrix24(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Order sync timeout after 30 seconds')), 30000)
        )
      ]);
      
      const duration = Date.now() - startTime;
      
      testResults.tests.push({
        test: 'Order Service Sync',
        status: 'success',
        details: syncResult,
        duration: `${duration}ms`
      });
      
      console.log(`✅ Order Service sync successful:`, syncResult);
      
    } catch (syncError) {
      testResults.tests.push({
        test: 'Order Service Sync',
        status: 'error',
        details: {
          error: syncError instanceof Error ? syncError.message : 'Unknown error',
          stack: syncError instanceof Error ? syncError.stack : undefined
        }
      });
      console.error('❌ Order Service sync failed:', syncError);
    }
    
    // Overall status
    const hasErrors = testResults.tests.some(test => test.status === 'error');
    const hasWarnings = testResults.tests.some(test => test.status === 'warning');
    
    return NextResponse.json({
      success: !hasErrors,
      message: hasErrors ? 'Some tests failed' : hasWarnings ? 'Tests completed with warnings' : 'All tests passed',
      data: testResults
    });
    
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Comprehensive test failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
