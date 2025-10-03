import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🔧 Simple Bitrix24 Test...');
    
    const baseUrl = process.env.NEXT_PUBLIC_BITRIX24_BASE_URL;
    const restUrl = process.env.NEXT_PUBLIC_BITRIX24_REST_URL;
    
    console.log('📊 Environment check:', {
      baseUrl: baseUrl ? 'SET' : 'NOT SET',
      restUrl: restUrl ? 'SET' : 'NOT SET'
    });
    
    if (!baseUrl || !restUrl) {
      return NextResponse.json({
        success: false,
        error: 'Bitrix24 environment variables not set',
        details: { baseUrl: !!baseUrl, restUrl: !!restUrl }
      }, { status: 500 });
    }
    
    // Test the URL construction
    const fullUrl = `${baseUrl}${restUrl}/crm.deal.list.json`;
    console.log('🔗 Full URL:', fullUrl);
    
    // Simple test request
    const requestBody = {
      filter: {
        LOGIC: "OR",
        "0": { "STAGE_ID": "C2:PREPAYMENT_INVOICE" },
        "1": { "STAGE_ID": "C2:EXECUTING" }
      },
      order: { "DATE_CREATE": "DESC" },
      select: ["ID", "TITLE", "STAGE_ID"],
      start: 0,
      limit: 1
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Bitrix24 API Error:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Bitrix24 API error',
        details: {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500) // Limit error text
        }
      }, { status: 500 });
    }
    
    const data = await response.json();
    console.log('✅ Bitrix24 API Success:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Bitrix24 API test successful',
      data: {
        url: fullUrl,
        dealsCount: data.result ? data.result.length : 0,
        sampleDeal: data.result && data.result.length > 0 ? {
          id: data.result[0].ID,
          title: data.result[0].TITLE,
          stage: data.result[0].STAGE_ID
        } : null,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Simple Bitrix24 test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Simple Bitrix24 test failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
