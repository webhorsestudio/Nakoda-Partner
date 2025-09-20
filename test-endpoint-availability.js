// Test endpoint availability
async function testEndpointAvailability() {
  console.log('=== TESTING AXIS PG ENDPOINT AVAILABILITY ===');
  
  const endpoints = [
    'https://sandbox-axispg.freecharge.in/payment/v1/checkout',
    'https://sandbox-axispg.freecharge.in/payment/v1/mock/checkout',
    'https://sandbox-axispg.freecharge.in/',
    'https://sandbox-axispg.freecharge.in/payment/'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        }
      });
      
      console.log(`Status: ${response.status}`);
      console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        console.log('✅ Endpoint is accessible');
      } else {
        console.log('❌ Endpoint returned error');
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

testEndpointAvailability();
