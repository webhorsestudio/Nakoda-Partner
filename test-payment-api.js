// Test Payment API Endpoint
const fetch = require('node-fetch');

async function testPaymentAPI() {
  console.log('🧪 Testing Payment API Endpoint...\n');

  try {
    // Test data
    const testData = {
      amount: 10,
      customerInfo: {
        customerName: 'Test Partner',
        customerEmailId: 'test@example.com',
        customerMobileNo: '9999999999',
        customerCountry: 'India'
      }
    };

    console.log('📤 Sending test request to /api/payment/checkout');
    console.log('Request data:', testData);

    const response = await fetch('http://localhost:3000/api/payment/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth, but we'll see the response
      },
      body: JSON.stringify(testData)
    });

    console.log('\n📥 Response received:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const responseData = await response.json();
    console.log('Response Data:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('\n✅ API endpoint is working correctly!');
    } else {
      console.log('\n❌ API endpoint returned an error');
    }

  } catch (error) {
    console.error('\n❌ Error testing API:', error.message);
  }
}

testPaymentAPI();
