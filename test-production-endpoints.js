// Test different production endpoints
const crypto = require('crypto');

const testData = {
  merchantId: 'MERec40511352',
  clientId: 'MERec40511352',
  callbackUrl: 'http://localhost:3000/api/payment/callback',
  merchantTxnId: 'TXN_TEST_' + Date.now(),
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

const signature = generateSignature(testData, 'M0bVnOHO...'); // Placeholder key
testData.signature = signature;

// Test different production endpoints
const productionEndpoints = [
  'https://axispg.freecharge.in/payment/v1/checkout',
  'https://axispg.freecharge.in/payment/v1/mock/checkout',
  'https://axispg.freecharge.in/payment/checkout',
  'https://axispg.freecharge.in/checkout',
  'https://axispg.freecharge.in/payment/v1/',
  'https://axispg.freecharge.in/payment/'
];

async function testProductionEndpoints() {
  console.log('=== TESTING PRODUCTION ENDPOINTS ===');
  
  for (const endpoint of productionEndpoints) {
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
          'Origin': 'https://axispg.freecharge.in',
          'Pragma': 'no-cache',
          'Referer': 'https://axispg.freecharge.in/payment/v1/mock/checkout',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Upgrade-Insecure-Requests': '1',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        },
        body: formData.toString(),
      });

      console.log(`Status: ${response.status}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      
      const responseText = await response.text();
      console.log(`Response length: ${responseText.length}`);
      
      if (response.status === 200) {
        console.log('✅ SUCCESS - 200 OK');
        if (responseText.includes('form')) {
          console.log('✅ Payment form detected');
        }
      } else if (response.status === 405) {
        console.log('❌ 405 Not Allowed - Wrong method or endpoint');
      } else if (response.status === 404) {
        console.log('❌ 404 Not Found - Endpoint does not exist');
      } else {
        console.log(`❌ Error ${response.status}`);
      }
      
      // Check for specific error patterns
      if (responseText.includes('SESSION_EXPIRED')) {
        console.log('❌ SESSION_EXPIRED detected');
      }
      if (responseText.includes('405 Not Allowed')) {
        console.log('❌ 405 Not Allowed detected');
      }
      if (responseText.includes('404 Not Found')) {
        console.log('❌ 404 Not Found detected');
      }
      
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
  }
}

testProductionEndpoints();
