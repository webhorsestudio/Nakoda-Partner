import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🔧 Environment Variables Check...');
    
    const envCheck = {
      NEXT_PUBLIC_BITRIX24_BASE_URL: !!process.env.NEXT_PUBLIC_BITRIX24_BASE_URL,
      NEXT_PUBLIC_BITRIX24_REST_URL: !!process.env.NEXT_PUBLIC_BITRIX24_REST_URL,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
    
    // Don't log actual values for security
    const safeEnvValues = {
      NEXT_PUBLIC_BITRIX24_BASE_URL: process.env.NEXT_PUBLIC_BITRIX24_BASE_URL ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_BITRIX24_REST_URL: process.env.NEXT_PUBLIC_BITRIX24_REST_URL ? 'SET' : 'NOT SET',
    };
    
    return NextResponse.json({
      success: true,
      message: 'Environment variables check completed',
      data: {
        envCheck,
        safeEnvValues,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Environment check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Environment check failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
