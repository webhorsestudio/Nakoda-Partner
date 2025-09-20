import { NextRequest, NextResponse } from 'next/server';
import { ACEFONE_CONFIG } from '@/config/acefone';

export async function GET(_request: NextRequest) {
  try {
    // Test Acefone API connectivity and authentication
    console.log('🧪 Testing Acefone API configuration...');
    
    // Check environment variables
    const configStatus = {
      hasApiToken: !!ACEFONE_CONFIG.API_TOKEN,
      hasUsername: !!ACEFONE_CONFIG.USERNAME,
      hasPassword: !!ACEFONE_CONFIG.PASSWORD,
      didNumber: ACEFONE_CONFIG.DID_NUMBER,
      baseUrl: ACEFONE_CONFIG.BASE_URL,
      authUrl: ACEFONE_CONFIG.AUTH_URL
    };

    console.log('🔧 Configuration status:', configStatus);

    if (!ACEFONE_CONFIG.API_TOKEN || !ACEFONE_CONFIG.USERNAME || !ACEFONE_CONFIG.PASSWORD) {
      return NextResponse.json({
        success: false,
        message: 'Acefone credentials not configured',
        config: configStatus,
        instructions: [
          '1. Add ACEFONE_API_TOKEN to your .env.local file',
          '2. Add ACEFONE_USERNAME to your .env.local file', 
          '3. Add ACEFONE_PASSWORD to your .env.local file',
          '4. Restart your development server'
        ]
      });
    }

    // Test authentication
    console.log('🔐 Testing Acefone authentication...');
    
    const authResponse = await fetch(ACEFONE_CONFIG.AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        username: ACEFONE_CONFIG.USERNAME,
        password: ACEFONE_CONFIG.PASSWORD,
        api_token: ACEFONE_CONFIG.API_TOKEN
      })
    });

    const authResult = await authResponse.json();
    
    console.log('🔐 Auth response status:', authResponse.status);
    console.log('🔐 Auth response data:', authResult);

    return NextResponse.json({
      success: authResponse.ok,
      status: authResponse.status,
      config: configStatus,
      authResponse: authResult,
      message: authResponse.ok ? 'Acefone API is working correctly' : 'Acefone API authentication failed'
    });

  } catch (error) {
    console.error('❌ Acefone test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to test Acefone API'
    }, { status: 500 });
  }
}
