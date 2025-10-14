// Production Testing API Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { ProductionTestFramework } from '@/utils/productionTestFramework';

export async function GET() {
  try {
    console.log('🧪 Starting Production Readiness Tests...');
    
    const testSuite = await ProductionTestFramework.runProductionTests();
    const report = ProductionTestFramework.generateTestReport(testSuite);
    
    return NextResponse.json({
      success: true,
      testSuite,
      report,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('❌ Production test framework error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to run production tests',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
