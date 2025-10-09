import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing Complete Call Flow with Detailed Logging');
    
    // Test data
    const testPartnerPhone = '+919326499348'; // Webhorse Studio
    const testDidNumber = '918065343250'; // DID number from Acefone
    const testCallId = 'detailed-test-' + Date.now();
    const testUuid = 'detailed-uuid-' + Date.now();
    
    console.log('📞 Test Parameters:');
    console.log('  Partner Phone:', testPartnerPhone);
    console.log('  DID Number:', testDidNumber);
    console.log('  Call ID:', testCallId);
    
    // Simulate the webhook call
    const webhookUrl = 'http://localhost:3000/api/acefone-dialplan';
    
    const webhookPayload = {
      call_id: testCallId,
      uuid: testUuid,
      caller_id_number: testPartnerPhone,
      call_to_number: testDidNumber,
      start_stamp: new Date().toISOString()
    };
    
    console.log('📤 Sending webhook payload:', webhookPayload);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });
    
    const result = await response.json();
    console.log('📥 Webhook response:', result);
    
    // Analyze the response
    if (result.transfer && result.transfer.data && result.transfer.data.length > 0) {
      const transferNumber = result.transfer.data[0];
      console.log('📞 Transfer number:', transferNumber);
      console.log('📞 Transfer number length:', transferNumber.length);
      console.log('📞 Transfer number format:', transferNumber);
      
      // Check if this matches what we expect
      const expectedCustomerPhone = '+917506873720';
      console.log('📞 Expected customer phone:', expectedCustomerPhone);
      console.log('📞 Transfer matches expected?', transferNumber === expectedCustomerPhone);
      
      return NextResponse.json({
        success: true,
        message: 'Call flow test completed',
        webhookResponse: result,
        transferNumber: transferNumber,
        expectedCustomerPhone: expectedCustomerPhone,
        transferMatches: transferNumber === expectedCustomerPhone,
        transferLength: transferNumber.length,
        transferFormat: transferNumber
      });
    } else {
      console.log('❌ No transfer data in response');
      return NextResponse.json({
        success: false,
        message: 'No transfer data in response',
        webhookResponse: result
      });
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
