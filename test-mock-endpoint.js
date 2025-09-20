// Test with the mock checkout endpoint from documentation
const crypto = require('crypto');

const testData = {
  merchantId: 'MERMER99dae8e',
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

// Generate signature
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

  const concatenatedString = filteredData.map(({ value }) => value).join('');
  const stringToHash = concatenatedString + merchantKey;
  return crypto.createHash('sha256').update(stringToHash).digest('hex');
}

const signature = generateSignature(testData, 'dummy_key_for_testing');
testData.signature = signature;

console.log('=== TESTING MOCK CHECKOUT ENDPOINT ===');
console.log('Using endpoint: https://sandbox-axispg.freecharge.in/payment/v1/mock/checkout');

async function testMockEndpoint() {
  const formData = new URLSearchParams();
  Object.entries(testData).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await fetch('https://sandbox-axispg.freecharge.in/payment/v1/mock/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Origin': 'https://sandbox-axispg.freecharge.in',
        'Pragma': 'no-cache',
        'Referer': 'https://sandbox-axispg.freecharge.in/payment/v1/mock/checkout',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    
    console.log('\n=== MOCK ENDPOINT RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Response length:', responseText.length);
    
    if (responseText.includes('SESSION_EXPIRED')) {
      console.log('❌ SESSION_EXPIRED detected');
    }
    if (responseText.includes('form')) {
      console.log('✅ Payment form detected');
    }
    if (responseText.includes('error')) {
      console.log('❌ Error detected');
    }
    
    // Check for specific error patterns
    const errorMatch = responseText.match(/"error":"([^"]+)"/);
    if (errorMatch) {
      console.log('Error:', errorMatch[1]);
    }
    
    const statusCodeMatch = responseText.match(/"statusCode":"([^"]+)"/);
    if (statusCodeMatch) {
      console.log('Status Code:', statusCodeMatch[1]);
    }
    
    // Check if it's a valid payment form
    if (responseText.includes('<form') && responseText.includes('<input')) {
      console.log('✅ Valid payment form detected!');
    } else {
      console.log('❌ Not a valid payment form');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testMockEndpoint();
