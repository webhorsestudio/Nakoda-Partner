// Test with complete request including all possible fields
const crypto = require('crypto');

const credentials = {
  merchantId: 'MERec40511352',
  merchantKey: 'W3gJPVkKNg3GO8aFC6aOz33/+0MYOBMxLbrqWmiYQ/s=',
  clientId: 'MERec40511352'
};

// Complete request with all possible fields
const testData = {
  merchantId: credentials.merchantId,
  clientId: credentials.clientId,
  callbackUrl: 'http://localhost:3000/api/payment/callback',
  merchantTxnId: 'TXN_COMPLETE_' + Date.now(),
  merchantTxnAmount: 10,
  currency: 'INR',
  timestamp: Math.floor(Date.now() / 1000),
  customerId: '2124',
  customerName: 'Webhorse Studio',
  customerEmailId: 'partner@example.com',
  customerMobileNo: '9326499348',
  customerStreetAddress: 'Mumbai, Maharashtra',
  customerCity: 'Mumbai',
  customerState: 'Maharashtra',
  customerPIN: '400053',
  customerCountry: 'India',
  tags: 'wallet_topup_partner_2124',
  udf1: 'partner_id:2124',
  udf2: 'wallet_topup',
  udf3: new Date().toISOString(),
  udf4: '',
  udf5: '',
  reconId: 'temp',
  merchantOrderId: 'ORDER_' + Date.now(),
  utilityBiller: '',
  verifiedAccountInfo: '',
  verifiedPayment: false,
  paymentMode: 'ALL',
  txnType: 'SALE',
  returnUrl: 'http://localhost:3000/partner/wallet?payment=success'
};

// Generate signature with all fields
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

console.log('=== TESTING COMPLETE REQUEST ===');
console.log('Merchant ID:', credentials.merchantId);
console.log('Key length:', credentials.merchantKey.length);
console.log('Generated signature:', signature);
console.log('Request data fields:', Object.keys(testData).length);

async function testCompleteRequest() {
  const endpoint = 'https://secure-axispg.freecharge.in/payment/v1/checkout';
  
  console.log(`\n--- Testing: ${endpoint} ---`);
  
  const formData = new URLSearchParams();
  Object.entries(testData).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, String(value));
    }
  });

  console.log('Form data fields:', formData.toString().split('&').length);
  console.log('Form data preview:', formData.toString().substring(0, 200) + '...');

  try {
    const response = await fetch(endpoint, {
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
      console.log('✅ SUCCESS - 200 OK');
      
      if (responseText.includes('<form') && responseText.includes('<input')) {
        console.log('✅ VALID PAYMENT FORM DETECTED!');
      } else if (responseText.includes('SESSION_EXPIRED')) {
        console.log('❌ SESSION_EXPIRED still detected');
        
        // Look for specific error details
        const errorMatch = responseText.match(/"error":"([^"]+)"/);
        if (errorMatch) {
          console.log('Error:', errorMatch[1]);
        }
        
        const statusCodeMatch = responseText.match(/"statusCode":"([^"]+)"/);
        if (statusCodeMatch) {
          console.log('Status Code:', statusCodeMatch[1]);
        }
        
        const errorNameMatch = responseText.match(/"errorName":"([^"]+)"/);
        if (errorNameMatch) {
          console.log('Error Name:', errorNameMatch[1]);
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
}

testCompleteRequest();
