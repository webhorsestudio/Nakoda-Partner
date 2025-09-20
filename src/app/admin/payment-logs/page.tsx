'use client';

import { useState } from 'react';
import PaymentLogViewer from '@/components/admin/payment-logs/PaymentLogViewer';
import ErrorAnalysis from '@/components/admin/payment-logs/ErrorAnalysis';
import { PaymentLogger } from '@/utils/paymentLogger';
import { createCheckoutRequest } from '@/utils/paymentUtils';

export default function PaymentLogsPage() {
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);

  const generateTestLogs = async () => {
    setIsGeneratingTest(true);
    
    try {
      // Generate test request
      const testRequest = createCheckoutRequest({
        amount: 100,
        customerInfo: {
          customerName: 'Test User',
          customerEmailId: 'test@example.com',
          customerMobileNo: '9999999999'
        }
      });

      const requestId = testRequest.merchantTxnId;

      // Log various types of events
      PaymentLogger.logRequest(testRequest, requestId);
      
      // Simulate different response scenarios
      PaymentLogger.log({
        type: 'RESPONSE',
        level: 'INFO',
        message: 'Payment gateway response received',
        requestId,
        data: {
          status: 200,
          statusText: 'OK',
          responseLength: 1500,
          hasSessionExpired: false,
          hasForm: true,
          hasPayment: true
        }
      });

      // Simulate session expired error
      PaymentLogger.logSessionExpired(testRequest, 'Session Expired Your session has expired. Please try again later.', requestId);

      // Simulate other errors
      PaymentLogger.logError(new Error('Network timeout'), requestId, 'API call');
      PaymentLogger.logError(new Error('Invalid signature'), requestId, 'Signature validation');

      // Simulate success
      PaymentLogger.log({
        type: 'SUCCESS',
        level: 'INFO',
        message: 'Payment completed successfully',
        requestId,
        data: {
          transactionId: 'TXN_123456789',
          amount: 100,
          status: 'SUCCESS'
        }
      });

      // Simulate callback
      PaymentLogger.logCallback({
        statusCode: 'SPG-0000',
        statusMessage: 'SUCCESS',
        merchantTxnId: requestId,
        txnReferenceId: 'REF_123456789',
        amount: 100,
        currency: 'INR',
        handlingFee: 0,
        taxAmount: 0,
        mode: 'UPI',
        subMode: 'COLLECT',
        signature: 'abc123def456'
      }, requestId);

    } catch (error) {
      console.error('Error generating test logs:', error);
    } finally {
      setIsGeneratingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Gateway Logs</h1>
          <p className="mt-2 text-gray-600">
            Monitor and debug payment gateway requests, responses, and errors in real-time.
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={generateTestLogs}
            disabled={isGeneratingTest}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isGeneratingTest ? 'Generating Test Logs...' : 'Generate Test Logs'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ErrorAnalysis />
        </div>

        <PaymentLogViewer />
      </div>
    </div>
  );
}
