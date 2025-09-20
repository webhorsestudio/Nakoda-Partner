// Test production endpoints with GET requests
async function testProductionGET() {
  console.log('=== TESTING PRODUCTION ENDPOINTS WITH GET ===');
  
  const endpoints = [
    'https://axispg.freecharge.in/payment/v1/checkout',
    'https://axispg.freecharge.in/payment/v1/mock/checkout',
    'https://axispg.freecharge.in/payment/checkout',
    'https://axispg.freecharge.in/checkout',
    'https://axispg.freecharge.in/payment/v1/',
    'https://axispg.freecharge.in/payment/',
    'https://axispg.freecharge.in/',
    'https://axispg.freecharge.in/payment'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n--- Testing GET: ${endpoint} ---`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        }
      });
      
      console.log(`Status: ${response.status}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      
      if (response.status === 200) {
        console.log('✅ SUCCESS - 200 OK');
        const responseText = await response.text();
        console.log(`Response length: ${responseText.length}`);
        
        if (responseText.includes('form')) {
          console.log('✅ Payment form detected');
        }
        if (responseText.includes('checkout')) {
          console.log('✅ Checkout page detected');
        }
        if (responseText.includes('payment')) {
          console.log('✅ Payment page detected');
        }
      } else if (response.status === 405) {
        console.log('❌ 405 Not Allowed - POST required');
      } else if (response.status === 404) {
        console.log('❌ 404 Not Found - Endpoint does not exist');
      } else if (response.status === 403) {
        console.log('❌ 403 Forbidden - Access denied');
      } else {
        console.log(`❌ Error ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
  }
}

testProductionGET();
