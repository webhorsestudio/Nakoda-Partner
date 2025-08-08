import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { mobile } = await request.json();
    
    console.log('Test OTP request for:', mobile);
    
    // Generate a test OTP
    const testOtp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Test OTP generated:', testOtp);
    
    return NextResponse.json({
      success: true,
      message: `Test OTP sent successfully to ${mobile}`,
      otp: testOtp,
      note: "This is a test OTP. In production, this would be sent via SMS."
    });
    
  } catch (error) {
    console.error('Test OTP error:', error);
    return NextResponse.json({
      success: false,
      message: "Test failed"
    }, { status: 500 });
  }
}
