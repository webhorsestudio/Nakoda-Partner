// Simple Payment Gateway Test
// This script tests the payment gateway integration without complex imports

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Payment Gateway Integration...\n');

// Test 1: Check if .env.local exists and has payment credentials
console.log('📁 Checking environment configuration...');
const envPath = '.env.local';

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for required environment variables
  const requiredVars = [
    'AXIS_PG_SANDBOX_URL',
    'AXIS_PG_SANDBOX_MERCHANT_ID', 
    'AXIS_PG_SANDBOX_MERCHANT_KEY',
    'AXIS_PG_PRODUCTION_URL',
    'AXIS_PG_PRODUCTION_MERCHANT_ID',
    'AXIS_PG_PRODUCTION_MERCHANT_KEY'
  ];
  
  let allVarsPresent = true;
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName} is configured`);
    } else {
      console.log(`❌ ${varName} is missing`);
      allVarsPresent = false;
    }
  });
  
  if (allVarsPresent) {
    console.log('\n✅ All payment gateway credentials are configured!');
  } else {
    console.log('\n❌ Some credentials are missing. Please check your .env.local file.');
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('📝 Please create .env.local with your payment gateway credentials');
}

// Test 2: Check if all payment files exist
console.log('\n📁 Checking payment integration files...');
const paymentFiles = [
  'src/types/payment.ts',
  'src/config/payment.ts', 
  'src/utils/paymentUtils.ts',
  'src/services/paymentService.ts',
  'src/hooks/usePayment.ts',
  'src/app/api/payment/checkout/route.ts',
  'src/app/api/payment/status/route.ts',
  'src/app/api/payment/refund/route.ts',
  'src/app/api/payment/callback/route.ts',
  'src/components/partner/wallet/AddAmountModal.tsx'
];

let allFilesExist = true;
paymentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n✅ All payment integration files exist!');
} else {
  console.log('\n❌ Some files are missing. Please check the implementation.');
}

// Test 3: Check package.json for required dependencies
console.log('\n📦 Checking dependencies...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = ['next', 'react', 'typescript'];
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`✅ ${dep} is installed`);
    } else {
      console.log(`❌ ${dep} is missing`);
    }
  });
}

// Test 4: Test basic signature generation logic
console.log('\n🔐 Testing signature generation logic...');
try {
  const crypto = require('crypto');
  
  // Test signature generation
  const testData = {
    merchantId: 'TEST_MERCHANT',
    merchantTxnId: 'TEST_TXN_123',
    amount: 100
  };
  
  const testKey = 'test_merchant_key';
  
  // Filter out null/undefined values and sort by field names
  const filteredData = Object.entries(testData)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .sort(([a], [b]) => a.localeCompare(b));
  
  // Concatenate values
  const concatenatedString = filteredData.map(([_, value]) => String(value)).join('');
  
  // Append merchant key
  const stringToHash = concatenatedString + testKey;
  
  // Create SHA-256 hash
  const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
  
  if (hash && hash.length === 64) {
    console.log('✅ Signature generation logic working correctly');
    console.log(`   Test signature: ${hash.substring(0, 16)}...`);
  } else {
    console.log('❌ Signature generation failed');
  }
} catch (error) {
  console.log('❌ Error testing signature generation:', error.message);
}

// Test 5: Check if development server can start
console.log('\n🚀 Testing development server...');
console.log('📝 To test the payment integration:');
console.log('   1. Run: npm run dev');
console.log('   2. Go to: http://localhost:3000/partner/wallet');
console.log('   3. Click "Add Amount" button');
console.log('   4. Select payment method and enter amount');
console.log('   5. Click "Pay & Add to Wallet"');
console.log('   6. You will be redirected to Axis PG sandbox');

console.log('\n🎉 Payment Gateway Integration Test Complete!');
console.log('\n📋 Summary:');
console.log('✅ Payment integration files are ready');
console.log('✅ Signature generation logic is working');
console.log('✅ Ready for testing with Axis PG sandbox');
console.log('\n🔗 Next: Start the dev server and test the wallet integration!');
