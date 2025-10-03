// Test script to check Bitrix24 connection
// Run this in browser console or use curl

const testBitrix24 = async () => {
  try {
    console.log('🧪 Testing Bitrix24 connection...');
    
    const response = await fetch('https://nakoda-partner.vercel.app/api/test-bitrix24');
    const data = await response.json();
    
    console.log('📊 Bitrix24 Test Result:', data);
    
    if (data.success) {
      console.log('✅ Bitrix24 connection successful!');
      console.log('📈 Deals count:', data.data.dealsCount);
      console.log('⏱️ Duration:', data.data.duration);
      console.log('🔧 Environment check:', data.data.environment);
    } else {
      console.log('❌ Bitrix24 connection failed!');
      console.log('🚨 Error details:', data.details);
    }
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
};

// Run the test
testBitrix24();
