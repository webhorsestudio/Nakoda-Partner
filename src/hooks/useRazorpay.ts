// Modern Razorpay Hook for React 19 + Next.js 15+ with WebView Support
'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  isWebView, 
  isFlutterWebView, 
  sendPaymentResultToFlutter,
  sendPaymentStartedToFlutter,
  sendPaymentPollingStartedToFlutter,
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
  method?: {
    upi?: boolean;
    upi_apps?: string[];
    netbanking?: boolean;
    wallet?: boolean;
    card?: boolean;
  };
  modal?: {
    backdropclose?: boolean;
    escape?: boolean;
    handleback?: boolean;
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
  isPolling: boolean;
}

export const useRazorpay = (): UseRazorpayReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentPoller, setPaymentPoller] = useState<PaymentPoller | null>(null);
  const [isPolling, setIsPolling] = useState(false);

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

  // Payment polling handlers
  const handlePaymentSuccess = useCallback((data: Record<string, unknown>) => {
    console.log('🎉 Payment successful via polling:', data);
    
    // Stop polling
    if (paymentPoller) {
      paymentPoller.stopPolling();
      setPaymentPoller(null);
    }
    
    // Update UI
    setIsLoading(false);
    setIsPolling(false);
    setError(null);
    
    // Show success message
    toast.success('Payment completed successfully!', {
      duration: 3000,
      position: 'top-right',
    });
    
    // Send success to Flutter if in WebView
    if (webViewDetected) {
      sendPaymentResultToFlutter({
        success: true,
        paymentId: data.payment_id as string,
        orderId: data.order_id as string,
        amount: data.amount as number,
      });
    }
    
    // Success callback will be handled by the component
    
  }, [paymentPoller, webViewDetected]);

  const handlePaymentFailure = useCallback((error: string) => {
    console.log('💥 Payment failed via polling:', error);
    
    // Stop polling
    if (paymentPoller) {
      paymentPoller.stopPolling();
      setPaymentPoller(null);
    }
    
    // Update UI
    setIsLoading(false);
    setIsPolling(false);
    setError(error);
    
    // Show error message
    toast.error(`Payment failed: ${error}`, {
      duration: 5000,
      position: 'top-right',
    });
    
    // Send failure to Flutter if in WebView
    if (webViewDetected) {
      sendPaymentResultToFlutter({
        success: false,
        error: error,
      });
    }
    
  }, [paymentPoller, webViewDetected]);

  const handlePaymentTimeout = useCallback(() => {
    console.log('⏰ Payment timeout via polling');
    
    // Stop polling
    if (paymentPoller) {
      paymentPoller.stopPolling();
      setPaymentPoller(null);
    }
    
    // Update UI
    setIsLoading(false);
    setIsPolling(false);
    setError('Payment timeout. Please try again.');
    
    // Show timeout message
    toast.error('Payment timeout. Please try again.', {
      duration: 5000,
      position: 'top-right',
    });
    
    // Send timeout to Flutter if in WebView
    if (webViewDetected) {
      sendPaymentResultToFlutter({
        success: false,
        error: 'Payment timeout',
      });
    }
    
  }, [paymentPoller, webViewDetected]);

  // Enhanced UPI detection override for WebView (React 19 + Next.js 15+ compatible)
  const _injectUPIDetectionOverride = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const script = `
      (function() {
        console.log('🔧 Injecting enhanced UPI detection override for WebView...');
        
        // Wait for Razorpay to be available
        const waitForRazorpay = () => {
          return new Promise((resolve) => {
            if (window.Razorpay) {
              resolve(window.Razorpay);
            } else {
              const checkInterval = setInterval(() => {
                if (window.Razorpay) {
                  clearInterval(checkInterval);
                  resolve(window.Razorpay);
                }
              }, 100);
            }
          });
        };

        // Enhanced UPI apps list for WebView
        const mockUPIApps = [
          'com.google.android.apps.nfp.payment', // Google Pay
          'com.phonepe.app', // PhonePe
          'net.one97.paytm', // Paytm
          'com.dreamplug.androidapp', // CRED
          'com.amazon.mShop.android.shopping', // Amazon Pay
          'com.mobikwik_new', // MobiKwik
          'com.freecharge.android', // FreeCharge
          'com.jio.jiopay', // JioPay
          'com.bharatpe.app', // BharatPe
          'com.whatsapp', // WhatsApp Pay
          'com.truecaller', // Truecaller Pay
          'com.samsung.android.spay', // Samsung Pay
          'com.axis.mobile', // Axis Bank
          'com.hdfcbank.hdfcnetbanking', // HDFC Bank
          'com.icicibank.pockets', // ICICI Bank
        ];

        // Override Razorpay initialization
        const originalRazorpay = window.Razorpay;
        
        window.Razorpay = function(options) {
          console.log('🚀 Enhanced Razorpay initialization for WebView');
          
          // Force enable UPI methods with mock apps
          if (options && options.method) {
            options.method.upi = true;
            options.method.upi_apps = mockUPIApps;
            options.method.netbanking = true;
            options.method.wallet = true;
            options.method.card = true;
          } else {
            options.method = {
              upi: true,
              upi_apps: mockUPIApps,
              netbanking: true,
              wallet: true,
              card: true,
            };
          }

          // Enhanced modal options for WebView
          if (options.modal) {
            options.modal.backdropclose = false;
            options.modal.escape = false;
            options.modal.handleback = false;
          } else {
            options.modal = {
              backdropclose: false,
              escape: false,
              handleback: false,
            };
          }

          // Add WebView-specific theme
          if (!options.theme) {
            options.theme = {
              color: '#3B82F6',
              backdrop_color: 'rgba(0,0,0,0.8)',
            };
          }

          console.log('✅ Enhanced Razorpay options applied:', options);
          return new originalRazorpay(options);
        };

        // Copy all properties from original Razorpay
        Object.setPrototypeOf(window.Razorpay, originalRazorpay);
        Object.assign(window.Razorpay, originalRazorpay);
        
        console.log('✅ Enhanced UPI detection override injected successfully');
      })();
    `;

    // Execute the script
    const scriptElement = document.createElement('script');
    scriptElement.textContent = script;
    document.head.appendChild(scriptElement);
    
    console.log('✅ Enhanced UPI detection override script injected');
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

      // Inject enhanced UPI detection override BEFORE loading Razorpay
      if (webViewDetected) {
        console.log('🔧 WebView detected - injecting enhanced UPI override...');
        await _injectUPIDetectionOverride();
        
        // Wait a bit for the override to take effect
        await new Promise(resolve => setTimeout(resolve, 500));
      }

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
      
      // Enhanced WebView configuration
      const webViewConfig = webViewDetected ? {
        ...getWebViewRazorpayConfig(),
        // Force enable all payment methods for WebView
        method: {
          upi: true,
          netbanking: true,
          wallet: true,
          card: true,
          emi: true,
        },
        // Enhanced modal options for WebView
        modal: {
          backdropclose: false,
          escape: false,
          handleback: false,
        },
        // WebView-specific theme
        theme: {
          color: '#3B82F6',
          backdrop_color: 'rgba(0,0,0,0.8)',
        },
        // Force show all payment options
        notes: {
          source: 'webview_app',
          platform: 'flutter_webview',
          partner_id: params.partnerId,
          amount: params.amount.toString(),
        },
        // Prefill customer info
        prefill: {
          name: params.customerInfo?.customerName || 'Partner',
          email: params.customerInfo?.customerEmailId || 'partner@example.com',
          contact: params.customerInfo?.customerMobileNo || '9999999999',
        },
      } : {};
      
      const options: RazorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Nakoda Partner',
        description: 'Wallet Top-up',
        order_id: orderData.order_id,
        ...webViewConfig, // Apply WebView-specific config
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
        // Enhanced options for WebView
        ...(webViewDetected ? {
          method: {
            upi: true,
            upi_apps: [
              'com.google.android.apps.nfp.payment', // Google Pay
              'com.phonepe.app', // PhonePe
              'net.one97.paytm', // Paytm
              'com.dreamplug.androidapp', // CRED
              'com.amazon.mShop.android.shopping', // Amazon Pay
              'com.mobikwik_new', // MobiKwik
              'com.freecharge.android', // FreeCharge
              'com.jio.jiopay', // JioPay
              'com.bharatpe.app', // BharatPe
              'com.whatsapp', // WhatsApp Pay
            ],
            netbanking: true,
            wallet: true,
            card: true,
          },
          modal: {
            backdropclose: false,
            escape: false,
            handleback: false,
          },
        } : {}),
      };

      // Open Razorpay checkout
      const razorpayInstance = new razorpay(options);
      razorpayInstance.open();
      
      // Dismiss loading toast
      toast.dismiss();
      
      // Start payment polling for WebView scenarios
      if (webViewDetected) {
        console.log('🔄 WebView detected - starting payment polling...');
        setIsPolling(true);
        
        // Notify Flutter that payment has started
        sendPaymentStartedToFlutter({
          orderId: orderData.order_id,
          amount: params.amount,
          partnerId: params.partnerId
        });
        
        const poller = new PaymentPoller(
          orderData.order_id,
          null, // No payment ID yet
          handlePaymentSuccess,
          handlePaymentFailure,
          handlePaymentTimeout
        );
        
        setPaymentPoller(poller);
        poller.startPolling(3000, 300000); // Poll every 3 seconds for 5 minutes
        
        // Notify Flutter that polling has started
        sendPaymentPollingStartedToFlutter({
          orderId: orderData.order_id,
          amount: params.amount,
          partnerId: params.partnerId
        });
        
        toast.loading('Payment in progress...', {
          duration: 10000,
          position: 'top-right',
        });
      } else {
        toast.success('Payment gateway opened successfully!', {
          duration: 2000,
          position: 'top-right',
        });
      }

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
  }, [_injectUPIDetectionOverride, handlePaymentFailure, handlePaymentSuccess, handlePaymentTimeout, paymentPoller, webViewDetected]);

  return {
    initiatePayment,
    isLoading,
    error,
    clearError,
    isWebView: webViewDetected,
    isFlutterWebView: flutterWebViewDetected,
    isPolling,
  };
};
