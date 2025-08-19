import { NextRequest, NextResponse } from 'next/server';
import { generateAndStoreOTP, validateMobileNumber, cleanMobileNumber } from '@/services/otpService';

export async function POST(request: NextRequest) {
  try {
    const { mobile } = await request.json();

    // Input validation
    if (!mobile) {
      return NextResponse.json(
        { success: false, message: 'Mobile number is required' },
        { status: 400 }
      );
    }

    console.log('=== SEND-OTP API DEBUG ===');
    console.log('Original mobile:', mobile);
    console.log('Mobile type:', typeof mobile);
    console.log('Mobile length:', mobile.length);

    // Clean mobile number for consistent processing
    const cleanedMobile = cleanMobileNumber(mobile);
    console.log('Cleaned mobile:', cleanedMobile);

    // Validate mobile number format
    if (!validateMobileNumber(mobile)) {
      console.log('Mobile validation failed');
      return NextResponse.json(
        { success: false, message: 'Invalid mobile number format. Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    console.log('Mobile validation passed');
    console.log('================================');

    // Generate and store OTP server-side
    const result = await generateAndStoreOTP(cleanedMobile);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 429 } // Rate limit exceeded
      );
    }

    // Send OTP via Fast2SMS DLT API
    try {
      const apiUrl = 'https://www.fast2sms.com/dev/bulkV2';
      
      // Comprehensive environment variable debugging
      console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
      console.log('All process.env keys:', Object.keys(process.env).filter(key => key.includes('FAST2SMS')));
      console.log('FAST2SMS_API_KEY:', process.env.FAST2SMS_API_KEY);
      console.log('FAST2SMS_SENDER_ID:', process.env.FAST2SMS_SENDER_ID);
      console.log('FAST2SMS_TEMPLATE_ID:', process.env.FAST2SMS_TEMPLATE_ID);
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('================================');
      
      // Check required environment variables
      const apiKey = process.env.FAST2SMS_API_KEY;
      const senderId = process.env.FAST2SMS_SENDER_ID;
      const templateId = process.env.FAST2SMS_TEMPLATE_ID;
      
      if (!apiKey || !senderId || !templateId) {
        console.error('Missing required environment variables:');
        console.error('FAST2SMS_API_KEY:', apiKey ? 'SET' : 'NOT SET');
        console.error('FAST2SMS_SENDER_ID:', senderId ? 'SET' : 'NOT SET');
        console.error('FAST2SMS_TEMPLATE_ID:', templateId ? 'SET' : 'NOT SET');
        return NextResponse.json(
          { success: false, message: 'SMS service configuration error. Please contact administrator.' },
          { status: 500 }
        );
      }
      
      // Debug: Check environment variables
      console.log('Environment variables check:');
      console.log('FAST2SMS_API_KEY:', apiKey ? 'SET' : 'NOT SET');
      console.log('FAST2SMS_SENDER_ID:', senderId);
      console.log('FAST2SMS_TEMPLATE_ID:', templateId);
      console.log('NODE_ENV:', process.env.NODE_ENV);
      
      // Build URL with query parameters for DLT SMS
      const url = new URL(apiUrl);
      url.searchParams.append('authorization', apiKey);
      url.searchParams.append('route', 'dlt');
      url.searchParams.append('sender_id', senderId);
      url.searchParams.append('message', templateId);
      url.searchParams.append('numbers', cleanedMobile);
      url.searchParams.append('variables_values', result.otp || ''); // Pass OTP as variable
      url.searchParams.append('flash', '0');

      console.log('Request URL:', url.toString());

      const response = await fetch(url, {
        method: 'GET', // Fast2SMS uses GET with query parameters
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Fast2SMS Response:', data);

      if (data.return === true) {
        return NextResponse.json({
          success: true,
          message: 'OTP sent successfully to your mobile number',
          // Don't return the OTP to client
          expiresIn: '10 minutes'
        });
      } else {
        console.error('Fast2SMS API error:', data);
        return NextResponse.json(
          { success: false, message: `Failed to send OTP via SMS: ${data.message}` },
          { status: 500 }
        );
      }
    } catch (smsError) {
      console.error('SMS service error:', smsError);
      return NextResponse.json(
        { success: false, message: 'SMS service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
