import { NextRequest, NextResponse } from 'next/server';

// Fast2SMS API Configuration
const FAST2SMS_API_KEY = "CYZAqVtcxfOL8RNWkSK6EmJ5ov9Pped7wGXQUIbasFuyhrj3B4YPHwGOT9NFSLht0kDyfrq82QACjloI";
const FAST2SMS_SENDER_ID = "NuServ";
const FAST2SMS_MESSAGE_ID = "160562";

export async function POST(request: NextRequest) {
  try {
    const { mobile } = await request.json();
    
    console.log('Debug SMS request for:', mobile);
    
    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return NextResponse.json(
        { success: false, message: "Invalid mobile number format" },
        { status: 400 }
      );
    }

    // Generate a test OTP
    const testOtp = Math.floor(1000 + Math.random() * 9000).toString();
    
    console.log('Test OTP generated:', testOtp);
    
    // Test API call to Fast2SMS
    const apiBody = {
      route: "dlt",
      sender_id: FAST2SMS_SENDER_ID,
      message: FAST2SMS_MESSAGE_ID,
      variables_values: testOtp,
      schedule_time: "",
      flash: 0,
      numbers: mobile
    };

    console.log('API Request Body:', apiBody);
    console.log('API Key:', FAST2SMS_API_KEY);
    console.log('API URL:', 'https://www.fast2sms.com/dev/bulkV2');

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiBody)
    });

    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('API Response Data:', data);
    
    return NextResponse.json({
      success: true,
      debug: {
        mobile: mobile,
        otp: testOtp,
        apiKey: FAST2SMS_API_KEY.substring(0, 10) + '...',
        senderId: FAST2SMS_SENDER_ID,
        messageId: FAST2SMS_MESSAGE_ID,
        apiBody: apiBody,
        responseStatus: response.status,
        responseData: data,
        apiReturn: data.return,
        apiMessage: data.message
      },
      message: data.return === true ? "SMS API call successful" : "SMS API call failed",
      otp: testOtp
    });
    
  } catch (error) {
    console.error('Debug SMS error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: "Debug failed"
    }, { status: 500 });
  }
}
