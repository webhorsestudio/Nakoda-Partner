import { NextRequest, NextResponse } from 'next/server';

// Fast2SMS API Configuration
const FAST2SMS_API_KEY = "CYZAqVtcxfOL8RNWkSK6EmJ5ov9Pped7wGXQUIbasFuyhrj3B4YPHwGOT9NFSLht0kDyfrq82QACjloI";
const FAST2SMS_SENDER_ID = "NuServ";
const FAST2SMS_MESSAGE_ID = "160562";

export async function POST(request: NextRequest) {
  try {
    const { mobile } = await request.json();
    
    console.log('Test SMS request for:', mobile);
    
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
    
    // Real API call to Fast2SMS
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

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiBody)
    });

    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.return === true) {
      return NextResponse.json({
        success: true,
        message: `Test SMS sent successfully to ${mobile}`,
        otp: testOtp,
        note: "This is a test SMS. Check your mobile for the OTP."
      });
    } else {
      return NextResponse.json({
        success: false,
        message: data.message?.[0] || data.message || "Failed to send test SMS"
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Test SMS error:', error);
    return NextResponse.json({
      success: false,
      message: "Test failed"
    }, { status: 500 });
  }
}
