import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Detailed Indian Mobile Number Analysis');
    
    const customerPhone = '917506873720';
    const last10Digits = customerPhone.substring(2); // 7506873720
    
    console.log('📞 Full number:', customerPhone);
    console.log('📞 Last 10 digits:', last10Digits);
    
    // Indian mobile number rules:
    // - Must be 10 digits
    // - First digit: 6, 7, 8, or 9
    // - Second digit: 0-9 (but some combinations are invalid)
    
    const analysis = {
      fullNumber: customerPhone,
      last10Digits: last10Digits,
      length: last10Digits.length,
      firstDigit: last10Digits[0],
      secondDigit: last10Digits[1],
      isValidLength: last10Digits.length === 10,
      startsWithValidDigit: /^[6789]/.test(last10Digits),
      // Check if it's a valid Indian mobile number
      isValidIndianMobile: /^[6789]\d{9}$/.test(last10Digits)
    };
    
    console.log('📞 Analysis:', analysis);
    
    // Test what Acefone might expect
    const acefoneFormats = [
      {
        name: 'Current format (+91 prefix)',
        value: `+${customerPhone}`,
        description: 'What we are currently sending'
      },
      {
        name: '10-digit format',
        value: last10Digits,
        description: 'Just the 10 digits'
      },
      {
        name: '91 prefix format',
        value: customerPhone,
        description: '91 prefix without +'
      }
    ];
    
    console.log('📞 Acefone format options:', acefoneFormats);
    
    // The real question: Is 7506873720 a valid Indian mobile number?
    // Let me check if this could be a typo
    const possibleCorrections = [
      '7506873720', // Original
      '7506873721', // Last digit +1
      '7506873729', // Last digit 9
      '750687372',  // Missing last digit
      '75068737200', // Extra digit
    ];
    
    console.log('📞 Possible corrections:', possibleCorrections);
    
    return NextResponse.json({
      success: true,
      analysis: analysis,
      acefoneFormats: acefoneFormats,
      possibleCorrections: possibleCorrections,
      message: 'Detailed analysis complete'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
