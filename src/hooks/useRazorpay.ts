// Modern Razorpay Hook for React 19 + Next.js 15+ with WebView Support
'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  isWebView, 
  isFlutterWebView, 
  sendPaymentResultToFlutter, 
  PaymentPoller,
  getWebViewRazorpayConfig,
  handleWebViewPaymentCompletion
} from '@/utils/webViewUtils';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface UseRazorpayReturn {
  initiatePayment: (params: {
    amount: number;
    partnerId: string;
    customerInfo?: {
      customerName?: string;
      customerEmailId?: string;
      customerMobileNo?: string;
    };
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  isWebView: boolean;
  isFlutterWebView: boolean;
}

export const useRazorpay = (): UseRazorpayReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentPoller, setPaymentPoller] = useState<PaymentPoller | null>(null);

  // Detect WebView environment
  const webViewDetected = isWebView();
  const flutterWebViewDetected = isFlutterWebView();

  // Cleanup payment poller on unmount
  useEffect(() => {
    return () => {
      if (paymentPoller) {
        paymentPoller.stopPolling();
      }
    };
  }, [paymentPoller]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const initiatePayment = useCallback(async (params: {
    amount: number;
    partnerId: string;
    customerInfo?: {
      customerName?: string;
      customerEmailId?: string;
      customerMobileNo?: string;
    };
  }) => {
    setIsLoading(true);
    setError(null);

        try {
          // Show loading toast
          const loadingToast = toast.loading('Creating payment order...', {
            position: 'top-right',
          });

          // Create Razorpay order
          const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.amount,
          customerInfo: params.customerInfo,
        }),
      });

          if (!orderResponse.ok) {
            const errorData = await orderResponse.json();
            toast.dismiss(loadingToast);
            throw new Error(errorData.message || 'Failed to create order');
          }

          const orderData = await orderResponse.json();
          console.log('✅ Razorpay order created:', orderData);
          
          // Update loading toast
          toast.dismiss(loadingToast);
          toast.loading('Opening payment gateway...', {
            position: 'top-right',
          });

      // Check if Razorpay script is already loaded
      if (!(window as unknown as { Razorpay?: unknown }).Razorpay) {
        // Load Razorpay script dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        await new Promise((resolve, reject) => {
          script.onload = () => {
            console.log('✅ Razorpay script loaded');
            resolve(true);
          };
          script.onerror = () => {
            console.error('❌ Failed to load Razorpay script');
            reject(new Error('Failed to load Razorpay script'));
          };
          document.head.appendChild(script);
        });
      }

          // Initialize Razorpay
          const razorpay = (window as unknown as { Razorpay: new (options: RazorpayOptions) => { open: () => void } }).Razorpay;
      
      // Get WebView-specific configuration if needed
      const webViewConfig = webViewDetected ? getWebViewRazorpayConfig() : {};
      
      const options: RazorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Nakoda Partner',
        description: 'Wallet Top-up',
        order_id: orderData.order_id,
        handler: async (response: RazorpayResponse) => {
          console.log('✅ Payment successful:', response);
          
          // Handle WebView scenario
          if (webViewDetected) {
            console.log('🔄 WebView payment detected, starting enhanced verification...');
            
            // Send payment result to Flutter immediately
            sendPaymentResultToFlutter({
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              amount: params.amount,
            });

            // Start payment polling for WebView
            const poller = new PaymentPoller(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              async (data) => {
                console.log('✅ Payment verified via polling:', data);
                toast.success('Payment successful! Your wallet has been updated.', {
                  duration: 4000,
                  position: 'top-right',
                });
                window.location.reload();
              },
              (error) => {
                console.error('❌ Payment polling failed:', error);
                toast.error(`Payment verification failed: ${error}`, {
                  duration: 5000,
                  position: 'top-right',
                });
              },
              () => {
                console.log('⏰ Payment polling timeout, trying manual verification...');
                // Try manual verification as fallback
                handleWebViewPaymentCompletion(
                  response.razorpay_payment_id,
                  response.razorpay_order_id,
                  params.amount,
                  params.partnerId
                );
              }
            );
            
            setPaymentPoller(poller);
            poller.startPolling(2000, 120000); // Poll every 2 seconds for 2 minutes
            
            return;
          }
          
          // Standard web browser payment handling
          try {
            // Verify payment on server
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                partnerId: params.partnerId,
                amount: params.amount,
              }),
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              console.log('✅ Payment verified:', verifyData);
              
              // Show success toast
              toast.success('Payment successful! Your wallet has been updated.', {
                duration: 4000,
                position: 'top-right',
              });
              
              // Refresh wallet balance
              window.location.reload();
            } else {
              let errorData;
              try {
                errorData = await verifyResponse.json();
              } catch (jsonError) {
                console.error('❌ Failed to parse error response as JSON:', jsonError);
                const textResponse = await verifyResponse.text();
                console.error('❌ Raw error response:', textResponse);
                errorData = { message: 'Server returned invalid response', rawResponse: textResponse };
              }
              console.error('❌ Payment verification failed:', errorData);
              const errorMessage = 'Payment verification failed: ' + (errorData.message || 'Unknown error');
              setError(errorMessage);
              toast.error(errorMessage, {
                duration: 5000,
                position: 'top-right',
              });
            }
          } catch (verifyError) {
            console.error('❌ Payment verification error:', verifyError);
            const errorMessage = 'Payment verification failed: ' + (verifyError instanceof Error ? verifyError.message : 'Unknown error');
            setError(errorMessage);
            toast.error(errorMessage, {
              duration: 5000,
              position: 'top-right',
            });
          }
        },
        prefill: {
          name: params.customerInfo?.customerName || 'Partner',
          email: params.customerInfo?.customerEmailId || 'partner@example.com',
          contact: params.customerInfo?.customerMobileNo || '9999999999',
        },
        notes: {
          partner_id: params.partnerId,
          purpose: 'wallet_topup',
        },
        theme: {
          color: '#3B82F6',
        },
      };

      // Open Razorpay checkout
      const razorpayInstance = new razorpay(options);
      razorpayInstance.open();
      
      // Dismiss loading toast and show success message
      toast.dismiss();
      toast.success('Payment gateway opened successfully!', {
        duration: 2000,
        position: 'top-right',
      });

      return { success: true, message: 'Razorpay checkout opened' };

    } catch (error) {
      console.error('Payment initiation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-right',
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    initiatePayment,
    isLoading,
    error,
    clearError,
    isWebView: webViewDetected,
    isFlutterWebView: flutterWebViewDetected,
  };
};
