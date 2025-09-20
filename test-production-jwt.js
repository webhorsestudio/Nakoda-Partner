// Test production credentials with JWT+JWE format as per documentation
const crypto = require('crypto');

// Production credentials from Axis PG team
const credentials = {
  merchantId: 'MERec40511352',
  clientId: 'MERec40511352',
  merchantKey: 'W3gJPVkKNg3GO8aFC6aOz33/+0MYOBMxLbrqWmiYQ/s=',
  baseUrl: 'https://checkout.freecharge.in'
};

// Test data
const testData = {
  merchantId: credentials.merchantId,
  callbackUrl: 'http://localhost:3000/api/payment/callback',
  merchantTxnId: 'TXN_JWT_' + Date.now(),
  merchantTxnAmount: 10,
  currency: 'INR',
  timestamp: Math.floor(Date.now() / 1000),
  customerId: '2124',
  customerName: 'Webhorse Studio',
  customerEmailId: 'partner@example.com',
  customerMobileNo: '9326499348',
  customerCity: 'Mumbai',
  customerState: 'Maharashtra',
  customerPIN: '400053',
  customerCountry: 'India',
  tags: 'wallet_topup_partner_2124',
  udf1: 'partner_id:2124',
  udf2: 'wallet_topup',
  udf3: new Date().toISOString(),
  paymentMode: 'ALL',
  txnType: 'SALE',
  returnUrl: 'http://localhost:3000/partner/wallet?payment=success'
};

// Generate signature
function generateSignature(data, merchantKey) {
  const signatureFields = [
    'merchantId', 'callbackUrl', 'merchantTxnId', 'merchantTxnAmount', 'currency',
    'tags', 'customerId', 'customerName', 'customerEmailId', 'customerMobileNo',
    'customerStreetAddress', 'customerCity', 'customerState', 'customerPIN',
    'customerCountry', 'timestamp', 'udf1', 'udf2', 'udf3', 'reconId',
    'merchantOrderId', 'utilityBiller'
  ];

  const filteredData = signatureFields
    .filter(field => data[field] !== null && data[field] !== undefined && data[field] !== '')
    .map(field => ({ field, value: String(data[field]) }))
    .sort((a, b) => a.field.localeCompare(b.field));

  const concatenatedString = filteredData.map(({ value }) => value).join('');
  const stringToHash = concatenatedString + merchantKey;
  return crypto.createHash('sha256').update(stringToHash).digest('hex');
}

const signature = generateSignature(testData, credentials.merchantKey);
testData.signature = signature;

console.log('=== TESTING PRODUCTION WITH JWT+JWE FORMAT ===');
console.log('Merchant ID:', credentials.merchantId);
console.log('Client ID:', credentials.clientId);
console.log('Key length:', credentials.merchantKey.length);
console.log('Generated signature:', signature);

// Test 1: Try with form data (as we were doing before)
async function testFormData() {
  console.log('\n--- TEST 1: Form Data Format ---');
  
  const formData = new URLSearchParams();
  Object.entries(testData).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await fetch(`${credentials.baseUrl}/payment/v1/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Origin': credentials.baseUrl,
        'Pragma': 'no-cache',
        'Referer': `${credentials.baseUrl}/`,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Response length: ${responseText.length}`);
    
    if (response.status === 200) {
      if (responseText.includes('<form') && responseText.includes('<input')) {
        console.log('✅ VALID PAYMENT FORM DETECTED!');
        return true;
      } else if (responseText.includes('SESSION_EXPIRED')) {
        console.log('❌ SESSION_EXPIRED detected');
      } else {
        console.log('⚠️ 200 OK but unexpected response');
      }
    } else {
      console.log(`❌ Error ${response.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
  
  return false;
}

// Test 2: Try with JSON format (as per documentation)
async function testJsonFormat() {
  console.log('\n--- TEST 2: JSON Format (JWT+JWE) ---');
  
  // For now, let's try with simple JSON (without JWT+JWE encryption)
  // In production, this would need proper JWT+JWE encryption
  const requestBody = {
    clientId: credentials.clientId,
    encData: JSON.stringify(testData) // This should be JWT+JWE encrypted in production
  };

  try {
    const response = await fetch(`${credentials.baseUrl}/payment/v1/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Origin': credentials.baseUrl,
        'Pragma': 'no-cache',
        'Referer': `${credentials.baseUrl}/`,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Response length: ${responseText.length}`);
    
    if (response.status === 200) {
      if (responseText.includes('<form') && responseText.includes('<input')) {
        console.log('✅ VALID PAYMENT FORM DETECTED!');
        return true;
      } else if (responseText.includes('SESSION_EXPIRED')) {
        console.log('❌ SESSION_EXPIRED detected');
      } else {
        console.log('⚠️ 200 OK but unexpected response');
      }
    } else {
      console.log(`❌ Error ${response.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
  
  return false;
}

// Test 3: Try with secure-axispg.freecharge.in
async function testSecureAxisPG() {
  console.log('\n--- TEST 3: secure-axispg.freecharge.in ---');
  
  const formData = new URLSearchParams();
  Object.entries(testData).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await fetch('https://secure-axispg.freecharge.in/payment/v1/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Origin': 'https://secure-axispg.freecharge.in',
        'Pragma': 'no-cache',
        'Referer': 'https://secure-axispg.freecharge.in/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Response length: ${responseText.length}`);
    
    if (response.status === 200) {
      if (responseText.includes('<form') && responseText.includes('<input')) {
        console.log('✅ VALID PAYMENT FORM DETECTED!');
        return true;
      } else if (responseText.includes('SESSION_EXPIRED')) {
        console.log('❌ SESSION_EXPIRED detected');
      } else {
        console.log('⚠️ 200 OK but unexpected response');
      }
    } else {
      console.log(`❌ Error ${response.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
  
  return false;
}

// Run all tests
async function runAllTests() {
  console.log('Starting production tests with correct credentials...\n');
  
  const results = await Promise.all([
    testFormData(),
    testJsonFormat(),
    testSecureAxisPG()
  ]);
  
  console.log('\n=== TEST RESULTS ===');
  console.log('Form Data Test:', results[0] ? '✅ SUCCESS' : '❌ FAILED');
  console.log('JSON Format Test:', results[1] ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Secure Axis PG Test:', results[2] ? '✅ SUCCESS' : '❌ FAILED');
  
  if (results.some(r => r)) {
    console.log('\n🎉 AT LEAST ONE TEST PASSED!');
  } else {
    console.log('\n❌ ALL TESTS FAILED');
  }
}

runAllTests();
