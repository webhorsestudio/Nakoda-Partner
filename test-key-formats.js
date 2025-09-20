// Test different key formats and signature generation methods
const crypto = require('crypto');

const credentials = {
  merchantId: 'MERec40511352',
  merchantKey: 'W3gJPVkKNg3GO8aFC6aOz33/+0MYOBMxLbrqWmiYQ/s=',
  clientId: 'MERec40511352'
};

const testData = {
  merchantId: credentials.merchantId,
  clientId: credentials.clientId,
  callbackUrl: 'http://localhost:3000/api/payment/callback',
  merchantTxnId: 'TXN_KEY_TEST_' + Date.now(),
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

// Test different signature generation methods
function generateSignature1(data, merchantKey) {
  // Method 1: Standard approach
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

function generateSignature2(data, merchantKey) {
  // Method 2: Include verifiedAccountInfo and verifiedPayment
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

function generateSignature3(data, merchantKey) {
  // Method 3: Use base64 decoded key
  try {
    const decodedKey = Buffer.from(merchantKey, 'base64').toString('utf8');
    console.log('Decoded key length:', decodedKey.length);
    console.log('Decoded key preview:', decodedKey.substring(0, 20) + '...');
    
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
    const stringToHash = concatenatedString + decodedKey;
    return crypto.createHash('sha256').update(stringToHash).digest('hex');
  } catch (error) {
    console.log('Error decoding key:', error.message);
    return generateSignature1(data, merchantKey);
  }
}

// Test all signature methods
console.log('=== TESTING DIFFERENT SIGNATURE METHODS ===');

const signature1 = generateSignature1(testData, credentials.merchantKey);
const signature2 = generateSignature2(testData, credentials.merchantKey);
const signature3 = generateSignature3(testData, credentials.merchantKey);

console.log('Method 1 (Standard):', signature1);
console.log('Method 2 (With verified fields):', signature2);
console.log('Method 3 (Base64 decoded key):', signature3);

// Test with each signature
async function testWithSignature(signature, methodName) {
  console.log(`\n=== TESTING WITH ${methodName} ===`);
  
  const testDataWithSignature = { ...testData, signature };
  
  const formData = new URLSearchParams();
  Object.entries(testDataWithSignature).forEach(([key, value]) => {
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
    console.log(`Response length: ${responseText.length}`);
    
    if (response.status === 200) {
      if (responseText.includes('<form') && responseText.includes('<input')) {
        console.log('✅ VALID PAYMENT FORM DETECTED!');
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

// Test all methods
async function testAllMethods() {
  const methods = [
    { signature: signature1, name: 'METHOD 1 (Standard)' },
    { signature: signature2, name: 'METHOD 2 (With verified fields)' },
    { signature: signature3, name: 'METHOD 3 (Base64 decoded key)' }
  ];
  
  for (const method of methods) {
    const success = await testWithSignature(method.signature, method.name);
    if (success) {
      console.log(`\n🎉 SUCCESS WITH ${method.name}!`);
      break;
    }
  }
}

testAllMethods();
