// Test with exact format from documentation
const crypto = require('crypto');

// Production credentials from Axis PG team
const credentials = {
  merchantId: 'MERec40511352',
  clientId: 'MERec40511352',
  merchantKey: 'W3gJPVkKNg3GO8aFC6aOz33/+0MYOBMxLbrqWmiYQ/s=',
  baseUrl: 'https://checkout.freecharge.in'
};

// Test data exactly as per documentation example
const testData = {
  merchantId: 'MERec40511352',
  callbackUrl: 'http://localhost:3000/api/payment/callback',
  merchantTxnId: 'merchantTxn001',
  merchantTxnAmount: 1000.0,
  currency: 'INR',
  tags: '',
  customerId: 'customerId001',
  customerName: 'Aakash',
  customerEmailId: 'akash@gmail.com',
  customerMobileNo: '919199859854',
  customerStreetAddress: 'DLF Ph 3',
  customerCity: 'GURGAON',
  customerState: 'Haryana',
  customerPIN: '122002',
  customerCountry: 'India',
  timestamp: Math.floor(Date.now() / 1000),
  subMerchantPayInfo: '[{"subEntityId": "entity1", "subEntityTxnAmount": "500.0", "subEntityProduct": "P1"},{"subEntityId": "entity2","subEntityTxnAmount": "500.0", "subEntityProduct": "P2"}]',
  udf1: 'udf1',
  udf2: 'udf2',
  udf3: 'udf3',
  udf4: 'udf4',
  udf5: 'udf5',
  reconId: 'temp',
  merchantOrderId: 'asnjdnaskj'
};

// Generate signature exactly as per documentation
function generateSignature(data, merchantKey) {
  const signatureFields = [
    'merchantId', 'callbackUrl', 'merchantTxnId', 'merchantTxnAmount', 'currency',
    'verifiedAccountInfo', 'verifiedPayment', 'tags', 'customerId', 'customerName',
    'customerEmailId', 'customerMobileNo', 'customerStreetAddress', 'customerCity',
    'customerState', 'customerPIN', 'customerCountry', 'timestamp', 'subMerchantPayInfo',
    'udf1', 'udf2', 'udf3', 'udf4', 'udf5', 'reconId', 'merchantOrderId', 'utilityBiller'
  ];

  const filteredData = signatureFields
    .filter(field => data[field] !== null && data[field] !== undefined && data[field] !== '')
    .map(field => ({ field, value: String(data[field]) }))
    .sort((a, b) => a.field.localeCompare(b.field));

  console.log('Signature fields:', filteredData.map(f => f.field));
  
  const concatenatedString = filteredData.map(({ value }) => value).join('');
  const stringToHash = concatenatedString + merchantKey;
  return crypto.createHash('sha256').update(stringToHash).digest('hex');
}

const signature = generateSignature(testData, credentials.merchantKey);
testData.signature = signature;

console.log('=== TESTING WITH DOCUMENTATION FORMAT ===');
console.log('Merchant ID:', credentials.merchantId);
console.log('Generated signature:', signature);

// Test with different endpoints
const endpoints = [
  'https://checkout.freecharge.in/payment/v1/checkout',
  'https://secure-axispg.freecharge.in/payment/v1/checkout',
  'https://axispg.freecharge.in/payment/v1/checkout'
];

async function testEndpoint(endpoint) {
  console.log(`\n--- Testing: ${endpoint} ---`);
  
  const formData = new URLSearchParams();
  Object.entries(testData).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Origin': endpoint.split('/').slice(0, 3).join('/'),
        'Pragma': 'no-cache',
        'Referer': endpoint.split('/').slice(0, 3).join('/') + '/',
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
        
        // Look for specific error details
        const errorMatch = responseText.match(/"error":"([^"]+)"/);
        if (errorMatch) {
          console.log('Error:', errorMatch[1]);
        }
        
        const statusCodeMatch = responseText.match(/"statusCode":"([^"]+)"/);
        if (statusCodeMatch) {
          console.log('Status Code:', statusCodeMatch[1]);
        }
        
        const statusMessageMatch = responseText.match(/"statusMessage":"([^"]+)"/);
        if (statusMessageMatch) {
          console.log('Status Message:', statusMessageMatch[1]);
        }
        
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

// Test all endpoints
async function testAllEndpoints() {
  console.log('Testing all endpoints with documentation format...\n');
  
  const results = await Promise.all(
    endpoints.map(endpoint => testEndpoint(endpoint))
  );
  
  console.log('\n=== TEST RESULTS ===');
  endpoints.forEach((endpoint, index) => {
    console.log(`${endpoint}: ${results[index] ? '✅ SUCCESS' : '❌ FAILED'}`);
  });
  
  if (results.some(r => r)) {
    console.log('\n🎉 AT LEAST ONE TEST PASSED!');
  } else {
    console.log('\n❌ ALL TESTS FAILED');
  }
}

testAllEndpoints();
