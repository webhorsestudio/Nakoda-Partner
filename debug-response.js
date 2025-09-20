// Debug script to examine the full response
const crypto = require('crypto');

const testData = {
  merchantId: 'MERec40511352',
  clientId: 'MERec40511352',
  callbackUrl: 'http://localhost:3000/api/payment/callback',
  merchantTxnId: 'TXN_DEBUG_' + Date.now(),
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

async function debugResponse() {
  const formData = new URLSearchParams();
  Object.entries(testData).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await fetch('https://sandbox-axispg.freecharge.in/payment/v1/checkout', {
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
    
    console.log('=== FULL RESPONSE ANALYSIS ===');
    console.log('Status:', response.status);
    console.log('Response length:', responseText.length);
    
    // Look for specific error patterns
    const errorPatterns = [
      'SESSION_EXPIRED',
      'Session Expired',
      'SPG-0006',
      'Invalid signature',
      'Invalid merchant',
      'Merchant not found',
      'Invalid timestamp',
      'Signature verification failed',
      'errorName',
      'errorCode',
      'errorMessage'
    ];
    
    console.log('\n=== ERROR PATTERN ANALYSIS ===');
    errorPatterns.forEach(pattern => {
      if (responseText.includes(pattern)) {
        console.log(`✅ Found: ${pattern}`);
        // Extract context around the pattern
        const index = responseText.indexOf(pattern);
        const context = responseText.substring(Math.max(0, index - 100), index + 200);
        console.log(`Context: ...${context}...`);
      } else {
        console.log(`❌ Not found: ${pattern}`);
      }
    });
    
    // Look for JSON error data
    const jsonMatch = responseText.match(/"errorName":"([^"]+)"/);
    if (jsonMatch) {
      console.log('\n=== JSON ERROR FOUND ===');
      console.log('Error Name:', jsonMatch[1]);
    }
    
    const errorCodeMatch = responseText.match(/"errorCode":"([^"]+)"/);
    if (errorCodeMatch) {
      console.log('Error Code:', errorCodeMatch[1]);
    }
    
    // Check if it's a valid payment form
    const hasForm = responseText.includes('<form');
    const hasInput = responseText.includes('<input');
    const hasSubmit = responseText.includes('submit');
    
    console.log('\n=== FORM ANALYSIS ===');
    console.log('Has form tag:', hasForm);
    console.log('Has input tag:', hasInput);
    console.log('Has submit:', hasSubmit);
    
    if (hasForm) {
      console.log('✅ This appears to be a payment form');
    } else {
      console.log('❌ This is NOT a payment form');
    }
    
    // Save response to file for detailed analysis
    require('fs').writeFileSync('axis-pg-response.html', responseText);
    console.log('\n📁 Full response saved to axis-pg-response.html');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugResponse();
