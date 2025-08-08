import { NextRequest, NextResponse } from 'next/server';

// Fast2SMS API Configuration
const FAST2SMS_API_KEY = "CYZAqVtcxfOL8RNWkSK6EmJ5ov9Pped7wGXQUIbasFuyhrj3B4YPHwGOT9NFSLht0kDyfrq82QACjloI";
const FAST2SMS_SENDER_ID = "NuServ";
const FAST2SMS_MESSAGE_ID = "160562";

export async function POST(request: NextRequest) {
  try {
    const { mobile, otp } = await request.json();

    console.log('OTP Request:', { mobile, otp });

    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return NextResponse.json(
        { success: false, message: "Invalid mobile number format" },
        { status: 400 }
      );
    }

    // Generate OTP if not provided
    const otpToSend = otp || Math.floor(1000 + Math.random() * 9000).toString();
    
    console.log('Making real API call to Fast2SMS for:', mobile, 'OTP:', otpToSend);

    // Real API call to Fast2SMS for ALL numbers
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
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('API Response Data:', data);
    
    if (data.return === true) {
      console.log('API call successful');
      
      // For demo numbers, also return OTP in response for alert backup
      if (mobile === '7506873720' || mobile === '9999999999') {
        return NextResponse.json({
          success: true,
          message: "OTP sent successfully via SMS (Demo backup available)",
          otp: mobile === '7506873720' ? '7506' : '9999'
        });
      } else {
        return NextResponse.json({
          success: true,
          message: "OTP sent successfully via SMS"
        });
      }
    } else {
      console.log('API call failed:', data);
      
      // For demo numbers, still return success with alert backup
      if (mobile === '7506873720' || mobile === '9999999999') {
        return NextResponse.json({
          success: true,
          message: "Demo OTP available (SMS may be delayed)",
          otp: mobile === '7506873720' ? '7506' : '9999'
        });
      } else {
        return NextResponse.json({
          success: false,
          message: data.message?.[0] || data.message || "Failed to send OTP"
        }, { status: 400 });
      }
    }

  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // For demo numbers, still return success with alert backup
    if (mobile === '7506873720' || mobile === '9999999999') {
      return NextResponse.json({
        success: true,
        message: "Demo OTP available (Network error)",
        otp: mobile === '7506873720' ? '7506' : '9999'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Server error. Please try again."
      }, { status: 500 });
    }
  }
}
