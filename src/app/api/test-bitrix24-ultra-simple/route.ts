import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🔧 Ultra Simple Bitrix24 Test...');
    
    const baseUrl = process.env.NEXT_PUBLIC_BITRIX24_BASE_URL;
    const restUrl = process.env.NEXT_PUBLIC_BITRIX24_REST_URL;
    
    if (!baseUrl || !restUrl) {
      return NextResponse.json({
        success: false,
        error: 'Environment variables not set'
      }, { status: 500 });
    }
    
    const fullUrl = `${baseUrl}${restUrl}/crm.deal.list.json`;
    console.log('🔗 Testing URL:', fullUrl);
    
    // Ultra minimal request - just get 1 deal with minimal fields
    const requestBody = {
      select: ["ID", "TITLE"],
      start: 0,
      limit: 1
    };
    
    console.log('📤 Minimal request body:', JSON.stringify(requestBody));
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Bitrix24 Error:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Bitrix24 API error',
        details: {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 200)
        }
      }, { status: 500 });
    }
    
    const data = await response.json();
    console.log('✅ Bitrix24 Success:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Ultra simple Bitrix24 test successful',
      data: {
        dealsCount: data.result ? data.result.length : 0,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Ultra simple test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Ultra simple test failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
