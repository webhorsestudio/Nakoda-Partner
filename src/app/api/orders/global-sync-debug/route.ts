import { NextResponse } from "next/server";
import { bitrix24Service } from "@/services/bitrix24Service";

/**
 * GET /api/orders/global-sync-debug
 * Debug endpoint to test Bitrix24 connectivity and diagnose sync issues
 */
export async function GET() {
  try {
    console.log('🔍 Debug: Testing Bitrix24 connectivity...');
    
    const debugResults = {
      timestamp: new Date().toISOString(),
      tests: [] as Array<{
        test: string;
        status: 'info' | 'success' | 'error';
        details: Record<string, unknown>;
      }>
    };
    
    // Test 1: Check environment variables
    debugResults.tests.push({
      test: 'Environment Variables',
      status: 'info',
      details: {
        BITRIX24_BASE_URL: process.env.NEXT_PUBLIC_BITRIX24_BASE_URL || 'Not set',
        BITRIX24_REST_URL: process.env.NEXT_PUBLIC_BITRIX24_REST_URL || 'Not set'
      }
    });
    
    // Test 2: Test Bitrix24 API connectivity
    try {
      console.log('🔍 Debug: Testing Bitrix24 API call...');
      const deals = await bitrix24Service.fetchRecentDealsWithFallback();
      
      debugResults.tests.push({
        test: 'Bitrix24 API Call',
        status: 'success',
        details: {
          dealsCount: deals.length,
          sampleDeal: deals[0] ? {
            id: deals[0].ID,
            title: deals[0].TITLE,
            stage: deals[0].STAGE_ID
          } : null
        }
      });
      
      // Test 3: Test order transformation
      if (deals.length > 0) {
        try {
          const transformedOrder = bitrix24Service.transformDealToOrder(deals[0]);
          debugResults.tests.push({
            test: 'Order Transformation',
            status: 'success',
            details: {
              bitrix24Id: transformedOrder.bitrix24_id,
              title: transformedOrder.title,
              orderNumber: transformedOrder.order_number,
              customerName: transformedOrder.customer_name,
              mobileNumber: transformedOrder.mobile_number
            }
          });
        } catch (transformError) {
          debugResults.tests.push({
            test: 'Order Transformation',
            status: 'error',
            details: {
              error: transformError instanceof Error ? transformError.message : 'Unknown error'
            }
          });
        }
      }
      
    } catch (apiError) {
      debugResults.tests.push({
        test: 'Bitrix24 API Call',
        status: 'error',
        details: {
          error: apiError instanceof Error ? apiError.message : 'Unknown error',
          stack: apiError instanceof Error ? apiError.stack : undefined
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug information collected',
      data: debugResults
    });
    
  } catch (error) {
    console.error('❌ Debug: Failed', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
