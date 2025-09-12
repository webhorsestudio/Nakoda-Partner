// Test Payment Configuration
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing Payment Configuration...\n');

// Test environment variables
console.log('📋 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('AXIS_PG_SANDBOX_URL:', process.env.AXIS_PG_SANDBOX_URL);
console.log('AXIS_PG_SANDBOX_MERCHANT_ID:', process.env.AXIS_PG_SANDBOX_MERCHANT_ID);
console.log('AXIS_PG_SANDBOX_MERCHANT_KEY:', process.env.AXIS_PG_SANDBOX_MERCHANT_KEY ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

// Test configuration loading
console.log('\n🔧 Testing Configuration Loading:');
try {
  // Simulate the configuration loading
  const isProduction = process.env.NODE_ENV === 'production';
  const config = isProduction ? {
    baseUrl: process.env.AXIS_PG_PRODUCTION_URL || 'https://checkout.freecharge.in',
    merchantId: process.env.AXIS_PG_PRODUCTION_MERCHANT_ID || 'YOUR_MERCHANT_ID',
    clientId: process.env.AXIS_PG_PRODUCTION_MERCHANT_ID || 'YOUR_MERCHANT_ID',
    merchantKey: process.env.AXIS_PG_PRODUCTION_MERCHANT_KEY || 'YOUR_PRODUCTION_KEY',
  } : {
    baseUrl: process.env.AXIS_PG_SANDBOX_URL || 'https://checkout-sandbox.freecharge.in',
    merchantId: process.env.AXIS_PG_SANDBOX_MERCHANT_ID || 'DEMO_MERCHANT',
    clientId: process.env.AXIS_PG_SANDBOX_MERCHANT_ID || 'DEMO_MERCHANT',
    merchantKey: process.env.AXIS_PG_SANDBOX_MERCHANT_KEY || 'demo_key',
  };

  console.log('✅ Configuration loaded successfully:');
  console.log('   Base URL:', config.baseUrl);
  console.log('   Merchant ID:', config.merchantId);
  console.log('   Client ID:', config.clientId);
  console.log('   Merchant Key:', config.merchantKey ? 'SET' : 'NOT SET');

  // Test signature generation
  console.log('\n🔐 Testing Signature Generation:');
  const crypto = require('crypto');
  
  const testData = {
    merchantId: config.merchantId,
    merchantTxnId: 'TEST_TXN_123',
    amount: 100,
    currency: 'INR',
    timestamp: Math.floor(Date.now() / 1000)
  };
  
  // Filter and sort data
  const filteredData = Object.entries(testData)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .sort(([a], [b]) => a.localeCompare(b));
  
  const concatenatedString = filteredData.map(([_, value]) => String(value)).join('');
  const stringToHash = concatenatedString + config.merchantKey;
  const signature = crypto.createHash('sha256').update(stringToHash).digest('hex');
  
  console.log('✅ Signature generated successfully:');
  console.log('   Test signature:', signature.substring(0, 16) + '...');
  console.log('   Data to hash:', concatenatedString);
  console.log('   Merchant key:', config.merchantKey ? 'SET' : 'NOT SET');

} catch (error) {
  console.error('❌ Error loading configuration:', error.message);
}

console.log('\n🎉 Configuration Test Complete!');
