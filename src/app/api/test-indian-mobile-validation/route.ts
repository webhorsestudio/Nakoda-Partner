import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing Indian Mobile Number Validation');
    
    // Test the exact customer phone from database
    const customerPhone = '917506873720';
    console.log('📞 Original customer phone:', customerPhone);
    
    // Correct Indian mobile validation
    const isValidIndianMobile = (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      console.log('📞 Cleaned phone:', cleaned);
      
      if (cleaned.length === 13 && cleaned.startsWith('91')) {
        const last10 = cleaned.substring(2);
        console.log('📞 Last 10 digits:', last10);
        console.log('📞 First digit:', last10[0]);
        console.log('📞 Starts with 6,7,8,9?', /^[6789]/.test(last10));
        return /^[6789]\d{9}$/.test(last10);
      }
      return false;
    };
    
    // Test different formats
    const formats = [
      {
        name: 'Original from DB',
        value: customerPhone,
        cleaned: customerPhone.replace(/\D/g, ''),
        last10: customerPhone.substring(2),
        firstDigit: customerPhone.substring(2, 3),
        isValid: isValidIndianMobile(`+${customerPhone}`)
      },
      {
        name: 'With +91 prefix',
        value: `+${customerPhone}`,
        cleaned: `+${customerPhone}`.replace(/\D/g, ''),
        last10: customerPhone.substring(2),
        firstDigit: customerPhone.substring(2, 3),
        isValid: isValidIndianMobile(`+${customerPhone}`)
      },
      {
        name: '10-digit only',
        value: customerPhone.substring(2),
        cleaned: customerPhone.substring(2),
        last10: customerPhone.substring(2),
        firstDigit: customerPhone.substring(2, 3),
        isValid: /^[6789]\d{9}$/.test(customerPhone.substring(2))
      }
    ];
    
    console.log('📞 Format analysis:', formats);
    
    // Check what Acefone documentation says about phone formats
    console.log('📞 Acefone typically expects: +91XXXXXXXXXX format');
    console.log('📞 Our format: +917506873720');
    console.log('📞 Is this valid?', isValidIndianMobile(`+${customerPhone}`));
    
    return NextResponse.json({
      success: true,
      originalPhone: customerPhone,
      formats: formats,
      acefoneFormat: `+${customerPhone}`,
      isValidForAcefone: isValidIndianMobile(`+${customerPhone}`),
      message: 'Indian mobile validation complete'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
