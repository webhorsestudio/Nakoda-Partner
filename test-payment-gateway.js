// Test payment gateway with updated production URL
const crypto = require('crypto');

// Test data with correct production URL
const testData = {
  merchantId: 'MERec40511352',
  clientId: 'MERec40511352',
  callbackUrl: 'https://your-domain.com/api/payment/callback',
  merchantTxnId: 'TXN_TEST_' + Date.now(),
  merchantTxnAmount: 10,
  currency: 'INR',
  timestamp: Date.now(), // milliseconds
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
  returnUrl: 'https://your-domain.com/partner/wallet?payment=success'
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

const signature = generateSignature(testData, 'W3gJPVkKNg3GO8aFC6aOz33/+0MYOBMxLbrqWmiYQ/s=');
testData.signature = signature;

console.log('=== TESTING PAYMENT GATEWAY WITH UPDATED URL ===');
console.log('Production URL: https://checkout.freecharge.in');
console.log('Merchant ID:', testData.merchantId);
console.log('Callback URL:', testData.callbackUrl);
console.log('Timestamp (ms):', testData.timestamp);
console.log('Timestamp (date):', new Date(testData.timestamp).toISOString());
console.log('Generated signature:', signature);

// Test both sandbox and production
const endpoints = [
  {
    name: 'Sandbox',
    url: 'https://sandbox-axispg.freecharge.in/payment/v1/checkout',
    merchantKey: '119706bf-9068-4392-813a-b789d7bdc7b8',
    merchantId: 'y42rWymNiOKlXF',
    clientId: 'y42rWymNiOKlXF'
  },
  {
    name: 'Production (Updated)',
    url: 'https://checkout.freecharge.in/payment/v1/checkout',
    merchantKey: 'W3gJPVkKNg3GO8aFC6aOz33/+0MYOBMxLbrqWmiYQ/s=',
    merchantId: 'MERec40511352',
    clientId: 'MERec40511352'
  }
];

async function testEndpoint(endpoint) {
  console.log(`\n--- Testing ${endpoint.name} ---`);
  
  // Use correct merchant credentials for each endpoint
  const testDataWithCredentials = { 
    ...testData,
    merchantId: endpoint.merchantId,
    clientId: endpoint.clientId
  };
  testDataWithCredentials.signature = generateSignature(testDataWithCredentials, endpoint.merchantKey);
  
  const formData = new URLSearchParams();
  Object.entries(testDataWithCredentials).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Origin': endpoint.url.split('/').slice(0, 3).join('/'),
        'Pragma': 'no-cache',
        'Referer': endpoint.url.split('/').slice(0, 3).join('/') + '/',
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
        console.log('✅ SUCCESS! Payment form detected');
        console.log('Response preview:', responseText.substring(0, 200) + '...');
        return true;
      } else if (responseText.includes('SESSION_EXPIRED')) {
        console.log('❌ SESSION_EXPIRED detected');
        
        const errorMatch = responseText.match(/"error":"([^"]+)"/);
        if (errorMatch) {
          console.log('Error:', errorMatch[1]);
        }
        
        const statusCodeMatch = responseText.match(/"statusCode":"([^"]+)"/);
        if (statusCodeMatch) {
          console.log('Status Code:', statusCodeMatch[1]);
        }
        
        return false;
      } else if (responseText.includes('error') || responseText.includes('Error')) {
        console.log('⚠️ Error detected in response');
        console.log('Response preview:', responseText.substring(0, 300));
        return false;
      } else {
        console.log('⚠️ 200 OK but unexpected response');
        console.log('Response preview:', responseText.substring(0, 300));
        return false;
      }
    } else {
      console.log(`❌ HTTP Error ${response.status}`);
      console.log('Response preview:', responseText.substring(0, 300));
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
    return false;
  }
}

// Test all endpoints
async function testAllEndpoints() {
  console.log('Testing payment gateway with updated production URL...\n');
  
  const results = await Promise.all(
    endpoints.map(endpoint => testEndpoint(endpoint))
  );
  
  console.log('\n=== TEST RESULTS ===');
  endpoints.forEach((endpoint, index) => {
    console.log(`${endpoint.name}: ${results[index] ? '✅ SUCCESS' : '❌ FAILED'}`);
  });
  
  if (results.some(r => r)) {
    console.log('\n🎉 AT LEAST ONE TEST PASSED!');
    console.log('The payment gateway is working!');
  } else {
    console.log('\n❌ ALL TESTS FAILED');
    console.log('The issue persists - may need Axis PG support.');
  }
}

testAllEndpoints();