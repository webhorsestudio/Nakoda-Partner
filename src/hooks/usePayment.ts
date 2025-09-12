// Payment Hook for Axis PG Integration
import { useState, useCallback } from 'react';
import { PaymentResult } from '@/types/payment';

interface CustomerInfo {
  customerId?: string;
  customerName?: string;
  customerEmailId?: string;
  customerMobileNo?: string;
  customerStreetAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerPIN?: string;
  customerCountry?: string;
}

interface VerifiedAccountInfo {
  accountNumber: string;
  ifsc: string;
}

interface SubMerchantPayInfo {
  subEntityId: string;
  subEntityTxnAmount: number;
  subEntityType?: number;
  subEntityProduct: string;
}

interface UsePaymentReturn {
  initiatePayment: (params: {
    amount: number;
    customerInfo?: CustomerInfo;
    verifiedAccountInfo?: VerifiedAccountInfo[];
    subMerchantPayInfo?: SubMerchantPayInfo[];
  }) => Promise<PaymentResult>;
  checkPaymentStatus: (merchantTxnId: string, txnReferenceId?: string) => Promise<PaymentResult>;
  processRefund: (params: {
    txnReferenceId: string;
    refundAmount: number;
    refundType?: 'ONLINE' | 'OFFLINE';
  }) => Promise<PaymentResult>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const usePayment = (): UsePaymentReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const initiatePayment = useCallback(async (params: {
    amount: number;
    customerInfo?: CustomerInfo;
    verifiedAccountInfo?: VerifiedAccountInfo[];
    subMerchantPayInfo?: SubMerchantPayInfo[];
  }): Promise<PaymentResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payment API error:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if response is HTML (redirect page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        // Get the HTML content (redirect page)
        const htmlContent = await response.text();
        
        console.log('🔍 Payment redirect page received:', {
          length: htmlContent.length,
          preview: htmlContent.substring(0, 200) + '...',
          containsForm: htmlContent.includes('<form'),
          containsRedirect: htmlContent.includes('Redirecting to Payment Gateway')
        });
        
        // Create a temporary div to parse the HTML and extract form data
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const form = tempDiv.querySelector('form');
        
        if (form) {
          // Create a new form element and submit it
          const newForm = document.createElement('form');
          newForm.method = form.method || 'POST';
          newForm.action = form.action;
          newForm.style.display = 'none';
          
          // Copy all hidden inputs
          const inputs = form.querySelectorAll('input[type="hidden"]');
          inputs.forEach((input) => {
            const htmlInput = input as HTMLInputElement;
            const newInput = document.createElement('input');
            newInput.type = 'hidden';
            newInput.name = htmlInput.name;
            newInput.value = htmlInput.value;
            newForm.appendChild(newInput);
          });
          
          // Add form to body and submit
          document.body.appendChild(newForm);
          newForm.submit();
        } else {
          // Fallback: redirect to the response URL
          window.location.href = response.url;
        }
        
        return {
          success: true,
          transactionId: 'pending',
          redirectUrl: '',
          status: 'PENDING',
          message: 'Redirecting to payment gateway...'
        };
      } else {
        // Handle JSON response
        const data = await response.json();
        return {
          success: data.success,
          transactionId: data.transactionId,
          redirectUrl: data.redirectUrl,
          status: data.status,
          error: data.error ? {
            code: data.error,
            message: data.message,
            description: data.message,
            category: 'BUSINESS'
          } : undefined
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'PAYMENT_ERROR',
          message: errorMessage,
          description: 'Failed to initiate payment',
          category: 'TECHNICAL'
        }
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkPaymentStatus = useCallback(async (merchantTxnId: string, txnReferenceId?: string): Promise<PaymentResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantTxnId,
          txnReferenceId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check payment status');
      }

      const statusData = data.data;
      
      if (statusData.statusCode === 'SPG-0000') {
        return {
          success: true,
          transactionId: statusData.data?.merchantTxnId,
          referenceId: statusData.data?.txnReferenceId,
          amount: statusData.data?.amount,
          currency: statusData.data?.currency,
          status: 'SUCCESS'
        };
      } else if (statusData.statusCode === 'SPG-0002') {
        return {
          success: true,
          transactionId: statusData.data?.merchantTxnId,
          referenceId: statusData.data?.txnReferenceId,
          amount: statusData.data?.amount,
          currency: statusData.data?.currency,
          status: 'PENDING'
        };
      } else {
        return {
          success: false,
          transactionId: statusData.data?.merchantTxnId,
          referenceId: statusData.data?.txnReferenceId,
          amount: statusData.data?.amount,
          currency: statusData.data?.currency,
          status: 'FAILED',
          error: {
            code: statusData.statusCode,
            message: statusData.statusMessage,
            description: statusData.data?.errorDescription || statusData.statusMessage,
            category: 'BUSINESS'
          }
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'STATUS_CHECK_ERROR',
          message: errorMessage,
          description: 'Failed to check payment status',
          category: 'TECHNICAL'
        }
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processRefund = useCallback(async (params: {
    txnReferenceId: string;
    refundAmount: number;
    refundType?: 'ONLINE' | 'OFFLINE';
  }): Promise<PaymentResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process refund');
      }

      return {
        success: data.success,
        transactionId: data.data?.merchantTxnId,
        referenceId: data.data?.txnReferenceId,
        amount: data.data?.refundAmount,
        currency: 'INR',
        status: 'SUCCESS'
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'REFUND_ERROR',
          message: errorMessage,
          description: 'Failed to process refund',
          category: 'TECHNICAL'
        }
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    initiatePayment,
    checkPaymentStatus,
    processRefund,
    isLoading,
    error,
    clearError,
  };
};
