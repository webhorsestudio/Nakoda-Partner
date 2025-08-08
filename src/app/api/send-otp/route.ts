import { NextRequest, NextResponse } from 'next/server';

// Fast2SMS API Configuration
const FAST2SMS_API_KEY = "CYZAqVtcxfOL8RNWkSK6EmJ5ov9Pped7wGXQUIbasFuyhrj3B4YPHwGOT9NFSLht0kDyfrq82QACjloI";
const FAST2SMS_SENDER_ID = "NuServ";
const FAST2SMS_MESSAGE_ID = "160562";

export async function POST(request: NextRequest) {
  let mobile: string | undefined;
  
  try {
    const { mobile: mobileNumber, otp } = await request.json();
    mobile = mobileNumber;

    console.log('OTP Request:', { mobile, otp });

    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobile || !mobileRegex.test(mobile)) {
      return NextResponse.json(
        { success: false, message: "Invalid mobile number format" },
        { status: 400 }
      );
    }

    // Generate OTP if not provided
    const otpToSend = otp || Math.floor(1000 + Math.random() * 9000).toString();
    
    console.log('Making API call to Fast2SMS for:', mobile, 'OTP:', otpToSend);

    // API call to Fast2SMS
    const apiBody = {
      route: "dlt",
      sender_id: FAST2SMS_SENDER_ID,
      message: FAST2SMS_MESSAGE_ID,
      variables_values: otpToSend,
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

    console.log('API Response Status:', response.status);
    const data = await response.json();
    console.log('API Response Data:', data);
    
    if (data.return === true) {
      console.log('API call successful');
      return NextResponse.json({
        success: true,
        message: "OTP sent successfully via SMS",
        otp: otpToSend
      });
    } else {
      console.log('API call failed:', data);
      return NextResponse.json({
        success: false,
        message: data.message?.[0] || data.message || "Failed to send OTP"
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({
      success: false,
      message: "Server error. Please try again."
    }, { status: 500 });
  }
}
