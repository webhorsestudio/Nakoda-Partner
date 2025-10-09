import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing Customer Phone Formatting Logic');
    
    // Test the exact customer phone from database
    const customerPhone = '917506873720';
    console.log('📞 Original customer phone:', customerPhone);
    
    // Apply the exact same logic from acefone-dialplan
    const formattedCustomerPhone = customerPhone.startsWith('+91') ? customerPhone : 
                                  customerPhone.startsWith('91') ? `+${customerPhone}` :
                                  `+91${customerPhone}`;
    
    console.log('📞 Formatted customer phone:', formattedCustomerPhone);
    
    // Test what Acefone expects
    console.log('📞 What Acefone will receive:', formattedCustomerPhone);
    
    // Test if this is a valid Indian mobile number
    const isValidIndianMobile = (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      // Indian mobile numbers: +91 followed by 10 digits starting with 6,7,8,9
      if (cleaned.length === 13 && cleaned.startsWith('91')) {
        const last10 = cleaned.substring(2);
        return /^[6789]\d{9}$/.test(last10);
      }
      return false;
    };
    
    const isValid = isValidIndianMobile(formattedCustomerPhone);
    console.log('📞 Is valid Indian mobile?', isValid);
    
    // Test different formats that might work
    const alternativeFormats = [
      {
        name: 'Current format (from code)',
        value: formattedCustomerPhone,
        valid: isValidIndianMobile(formattedCustomerPhone)
      },
      {
        name: '10-digit format',
        value: customerPhone.substring(2), // Remove 91 prefix
        valid: /^[6789]\d{9}$/.test(customerPhone.substring(2))
      },
      {
        name: '91 prefix format',
        value: customerPhone,
        valid: isValidIndianMobile(`+${customerPhone}`)
      },
      {
        name: 'Direct 10-digit',
        value: '7506873720',
        valid: /^[6789]\d{9}$/.test('7506873720')
      }
    ];
    
    console.log('📞 Alternative formats:', alternativeFormats);
    
    return NextResponse.json({
      success: true,
      originalPhone: customerPhone,
      formattedPhone: formattedCustomerPhone,
      isValid: isValid,
      alternativeFormats: alternativeFormats,
      message: 'Phone formatting analysis complete'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
