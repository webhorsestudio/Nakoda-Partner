// Payment Polling Test Utility
// This file helps test the payment polling implementation

import { PaymentPoller } from './webViewUtils';

export const testPaymentPolling = () => {
  console.log('🧪 Testing Payment Polling Implementation...');
  
  // Mock test data
  const testOrderId = 'test_order_123';
  const testPaymentId = 'test_payment_456';
  
  // Test success handler
  const onSuccess = (data: Record<string, unknown>) => {
    console.log('✅ Test Success Handler Called:', data);
  };
  
  // Test failure handler
  const onFailure = (error: string) => {
    console.log('❌ Test Failure Handler Called:', error);
  };
  
  // Test timeout handler
  const onTimeout = () => {
    console.log('⏰ Test Timeout Handler Called');
  };
  
  // Create poller instance
  const poller = new PaymentPoller(
    testOrderId,
    testPaymentId,
    onSuccess,
    onFailure,
    onTimeout
  );
  
  console.log('🔄 Starting test polling...');
  poller.startPolling(1000, 10000); // Poll every 1 second for 10 seconds
  
  // Test cleanup after 15 seconds
  setTimeout(() => {
    console.log('🛑 Stopping test polling...');
    poller.stopPolling();
    console.log('✅ Payment Polling Test Complete');
  }, 15000);
  
  return poller;
};

// Export for use in development
export default testPaymentPolling;
