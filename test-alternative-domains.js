// Test alternative production domains
async function testAlternativeDomains() {
  console.log('=== TESTING ALTERNATIVE PRODUCTION DOMAINS ===');
  
  const domains = [
    'https://axispg.freecharge.in',
    'https://axis-pg.freecharge.in',
    'https://pg.freecharge.in',
    'https://payment.freecharge.in',
    'https://checkout.freecharge.in',
    'https://axispg.com',
    'https://axis-pg.com',
    'https://freecharge.in/payment',
    'https://freecharge.in/checkout'
  ];
  
  for (const domain of domains) {
    try {
      console.log(`\n--- Testing: ${domain} ---`);
      
      const response = await fetch(domain, {
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
        if (responseText.includes('axis')) {
          console.log('✅ Axis PG detected');
        }
      } else if (response.status === 404) {
        console.log('❌ 404 Not Found - Domain does not exist');
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

testAlternativeDomains();
