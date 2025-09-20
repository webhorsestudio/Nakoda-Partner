// Test production credentials with both URLs
const crypto = require('crypto');

// New production credentials
const credentials = {
  merchantId: 'MERec40511352',
  merchantKey: 'W3gJPVkKNg3GO8aFC6aOz33/+0MYOBMxLbrqWmiYQ/s=',
  clientId: 'MERec40511352'
};

const testData = {
  merchantId: credentials.merchantId,
  clientId: credentials.clientId,
  callbackUrl: 'http://localhost:3000/api/payment/callback',
  merchantTxnId: 'TXN_PROD_' + Date.now(),
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

// Generate signature with correct key
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

console.log('=== TESTING PRODUCTION CREDENTIALS ===');
console.log('Merchant ID:', credentials.merchantId);
console.log('Key length:', credentials.merchantKey.length);
console.log('Key preview:', credentials.merchantKey.substring(0, 10) + '...');
console.log('Generated signature:', signature);

// Test both URLs
const testUrls = [
  'https://checkout.freecharge.in/',
  'https://secure-axispg.freecharge.in/'
];

async function testProductionCredentials() {
  for (const baseUrl of testUrls) {
    console.log(`\n=== TESTING: ${baseUrl} ===`);
    
    const endpoints = [
      `${baseUrl}payment/v1/checkout`,
      `${baseUrl}payment/checkout`,
      `${baseUrl}checkout`,
      `${baseUrl}payment`,
      `${baseUrl}`
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n--- Testing POST: ${endpoint} ---`);
      
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
            'Origin': baseUrl,
            'Pragma': 'no-cache',
            'Referer': baseUrl,
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
            
            // Check for payment gateway specific elements
            if (responseText.includes('payment') || responseText.includes('checkout')) {
              console.log('✅ Payment gateway page detected');
            }
            
          } else if (responseText.includes('SESSION_EXPIRED')) {
            console.log('❌ SESSION_EXPIRED detected');
          } else if (responseText.includes('error') || responseText.includes('Error')) {
            console.log('❌ Error detected in response');
          } else {
            console.log('⚠️ 200 OK but no payment form detected');
          }
          
        } else if (response.status === 405) {
          console.log('❌ 405 Not Allowed - Wrong method or endpoint');
        } else if (response.status === 404) {
          console.log('❌ 404 Not Found - Endpoint does not exist');
        } else if (response.status === 400) {
          console.log('❌ 400 Bad Request - Invalid request data');
        } else if (response.status === 500) {
          console.log('❌ 500 Internal Server Error');
        } else {
          console.log(`❌ Error ${response.status}`);
        }
        
        // Check for specific error patterns
        if (responseText.includes('SESSION_EXPIRED')) {
          console.log('❌ SESSION_EXPIRED detected');
        }
        if (responseText.includes('Invalid signature')) {
          console.log('❌ Invalid signature detected');
        }
        if (responseText.includes('Invalid merchant')) {
          console.log('❌ Invalid merchant detected');
        }
        if (responseText.includes('SPG-0005')) {
          console.log('❌ SPG-0005: Invalid signature');
        }
        if (responseText.includes('SPG-0003')) {
          console.log('❌ SPG-0003: Invalid merchant id');
        }
        
      } catch (error) {
        console.log(`❌ Network error: ${error.message}`);
      }
    }
  }
}

testProductionCredentials();
