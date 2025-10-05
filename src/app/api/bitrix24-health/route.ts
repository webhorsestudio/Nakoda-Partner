import { NextResponse } from "next/server";
import { professionalBitrix24Service } from "@/services/professionalBitrix24Service";
import { bitrix24CircuitBreaker } from "@/lib/circuitBreaker";
import { bitrix24RateLimiter } from "@/lib/rateLimiter";

export async function GET() {
  try {
    console.log('🏥 Bitrix24 Health Check...');
    
    const circuitState = bitrix24CircuitBreaker.getState();
    const rateLimiterStats = bitrix24RateLimiter.getStats();
    
    // Test API connectivity
    let apiTest: { success: boolean; error: string | null } = { success: false, error: null };
    try {
      await professionalBitrix24Service.fetchDeals(0, 1);
      apiTest = { success: true, error: null };
    } catch (error) {
      apiTest = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
    
    const overallHealth = apiTest.success;
    
    return NextResponse.json({
      success: true,
      message: overallHealth ? 'Bitrix24 service is healthy' : 'Bitrix24 service has issues',
      data: {
        overallHealth,
        circuitBreaker: {
          state: circuitState,
          failureCount: bitrix24CircuitBreaker.getFailureCount()
        },
        rateLimiter: rateLimiterStats,
        apiTest,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
