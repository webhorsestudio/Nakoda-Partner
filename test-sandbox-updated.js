// Test sandbox with updated URL
const crypto = require('crypto');

// Test data for sandbox
const testData = {
  merchantId: 'y42rWymNiOKlXF',
  clientId: 'y42rWymNiOKlXF',
  callbackUrl: 'https://your-domain.com/api/payment/callback',
  merchantTxnId: 'TXN_SANDBOX_' + Date.now(),
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

const signature = generateSignature(testData, '119706bf-9068-4392-813a-b789d7bdc7b8');
testData.signature = signature;

console.log('=== TESTING SANDBOX WITH UPDATED URL ===');
console.log('Sandbox URL: https://checkout-sandbox.freecharge.in');
console.log('Merchant ID:', testData.merchantId);
console.log('Callback URL:', testData.callbackUrl);
console.log('Timestamp (ms):', testData.timestamp);
console.log('Timestamp (date):', new Date(testData.timestamp).toISOString());
console.log('Generated signature:', signature);

// Test the updated sandbox URL
async function testUpdatedSandbox() {
  console.log('\n--- Testing Updated Sandbox URL ---');
  
  const formData = new URLSearchParams();
  Object.entries(testData).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await fetch('https://checkout-sandbox.freecharge.in/payment/v1/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Origin': 'https://checkout-sandbox.freecharge.in',
        'Pragma': 'no-cache',
        'Referer': 'https://checkout-sandbox.freecharge.in/',
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

// Test the updated sandbox
testUpdatedSandbox();
