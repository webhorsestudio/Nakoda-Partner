import { NextResponse } from "next/server";
import { bitrix24Service } from "@/services/bitrix24Service";

export async function GET() {
  try {
    console.log('🧪 Testing Bitrix24 connection...');
    
    // Test 1: Check environment variables
    const envCheck = {
      BITRIX24_DOMAIN: !!process.env.BITRIX24_DOMAIN,
      BITRIX24_WEBHOOK_ID: !!process.env.BITRIX24_WEBHOOK_ID,
      BITRIX24_WEBHOOK_SECRET: !!process.env.BITRIX24_WEBHOOK_SECRET,
    };
    
    console.log('🔧 Environment check:', envCheck);
    
    // Test 2: Try to fetch deals with timeout
    console.log('📡 Attempting to fetch deals from Bitrix24...');
    const startTime = Date.now();
    
    const deals = await Promise.race([
      bitrix24Service.fetchRecentDealsWithFallback(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Bitrix24 API timeout after 15 seconds')), 15000)
      )
    ]);
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Bitrix24 test successful: ${Array.isArray(deals) ? deals.length : 'unknown'} deals in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      message: 'Bitrix24 connection test successful',
      data: {
        environment: envCheck,
        dealsCount: Array.isArray(deals) ? deals.length : 0,
        duration: `${duration}ms`,
        sampleDeal: Array.isArray(deals) && deals.length > 0 ? {
          id: deals[0].ID,
          title: deals[0].TITLE,
          stage: deals[0].STAGE_ID,
          created: deals[0].DATE_CREATE
        } : null,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Bitrix24 test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Bitrix24 connection test failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
