// Test if sandbox is working
const crypto = require('crypto');

// Sandbox credentials
const sandboxConfig = {
  baseUrl: 'https://sandbox-axispg.freecharge.in',
  merchantId: 'y42rWymNiOKlXF',
  clientId: 'y42rWymNiOKlXF',
  merchantKey: '119706bf-9068-4392-813a-b789d7bdc7b8'
};

const testData = {
  merchantId: sandboxConfig.merchantId,
  clientId: sandboxConfig.clientId,
  callbackUrl: 'http://localhost:3000/api/payment/callback',
  merchantTxnId: 'TXN_SANDBOX_' + Date.now(),
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

const signature = generateSignature(testData, sandboxConfig.merchantKey);
testData.signature = signature;

console.log('=== TESTING SANDBOX ENVIRONMENT ===');
console.log('Base URL:', sandboxConfig.baseUrl);
console.log('Merchant ID:', sandboxConfig.merchantId);
console.log('Generated signature:', signature);

async function testSandbox() {
  const formData = new URLSearchParams();
  Object.entries(testData).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await fetch(`${sandboxConfig.baseUrl}/payment/v1/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Origin': sandboxConfig.baseUrl,
        'Pragma': 'no-cache',
        'Referer': `${sandboxConfig.baseUrl}/payment/v1/mock/checkout`,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    
    console.log(`\nStatus: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Response length: ${responseText.length}`);
    
    if (response.status === 200) {
      if (responseText.includes('<form') && responseText.includes('<input')) {
        console.log('✅ SANDBOX IS WORKING! Payment form detected');
        
        // Extract form action
        const formActionMatch = responseText.match(/<form[^>]*action="([^"]*)"/);
        if (formActionMatch) {
          console.log(`Form action: ${formActionMatch[1]}`);
        }
        
        // Extract form method
        const formMethodMatch = responseText.match(/<form[^>]*method="([^"]*)"/);
        if (formMethodMatch) {
          console.log(`Form method: ${formMethodMatch[1]}`);
        }
        
        return true;
      } else if (responseText.includes('SESSION_EXPIRED')) {
        console.log('❌ SESSION_EXPIRED detected in sandbox');
        
        const errorMatch = responseText.match(/"error":"([^"]+)"/);
        if (errorMatch) {
          console.log('Error:', errorMatch[1]);
        }
        
        const statusCodeMatch = responseText.match(/"statusCode":"([^"]+)"/);
        if (statusCodeMatch) {
          console.log('Status Code:', statusCodeMatch[1]);
        }
        
        return false;
      } else {
        console.log('⚠️ 200 OK but unexpected response');
        return false;
      }
    } else {
      console.log(`❌ Sandbox error ${response.status}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
    return false;
  }
}

testSandbox().then(success => {
  if (success) {
    console.log('\n🎉 SANDBOX IS WORKING PERFECTLY!');
    console.log('You can use the sandbox environment for testing payments.');
  } else {
    console.log('\n❌ SANDBOX IS NOT WORKING');
    console.log('There might be an issue with the sandbox environment.');
  }
});
