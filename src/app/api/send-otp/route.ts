import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { mobile, otp } = await request.json();

    if (!mobile || !otp) {
      return NextResponse.json(
        { success: false, message: 'Mobile number and OTP are required' },
        { status: 400 }
      );
    }

    // Make API call to Fast2SMS
    const apiUrl = 'https://www.fast2SMS.com/dev/bulkV2';
    const apiBody = {
      route: 'otp',
      numbers: mobile,
      variables_values: otp,
      flash: 0
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.FAST2SMS_API_KEY || ''
      },
      body: JSON.stringify(apiBody)
    });

    const data = await response.json();

    if (data.return === true) {
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        otp: otp
      });
    } else {
      console.error('Fast2SMS API error:', data);
      return NextResponse.json(
        { success: false, message: 'Failed to send OTP' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
