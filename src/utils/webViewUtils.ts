// WebView Detection and Integration Utilities
export const isWebView = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes('wv') || // Android WebView
    userAgent.includes('webview') || // iOS WebView
    (window as unknown as { navigator?: { standalone?: boolean } }).navigator?.standalone === true || // iOS standalone
    (window as unknown as { flutter_inappwebview?: unknown }).flutter_inappwebview !== undefined || // Flutter WebView
    userAgent.includes('mobile') && userAgent.includes('safari') && !userAgent.includes('chrome') // iOS Safari in WebView
  );
};

// WebView Session Recovery Utilities
export const initializeWebViewSession = () => {
  if (typeof window === 'undefined') return;
  
  console.log('🔧 Initializing WebView session recovery...');
  
  // Listen for Flutter messages
  if (isFlutterWebView()) {
    try {
      // Set up message listener for session recovery
      (window as unknown as { flutter_inappwebview: { addEventListener: (event: string, callback: (data: Record<string, unknown>) => void) => void } }).flutter_inappwebview.addEventListener('message', (data: Record<string, unknown>) => {
        console.log('📨 Received message from Flutter:', data);
        
        if (data.type === 'restore_session' && data.token) {
          console.log('🔄 Restoring session from Flutter...');
          localStorage.setItem('auth-token', data.token as string);
          sessionStorage.setItem('auth-token', data.token as string);
          
          // Refresh the page to apply the restored session
          window.location.reload();
        }
      });
      
      console.log('✅ WebView session recovery initialized');
    } catch (error) {
      console.warn('⚠️ Failed to initialize WebView session recovery:', error);
    }
  }
};

// Enhanced WebView detection with Flutter-specific checks
export const isFlutterWebView = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const hasFlutterWebView = (window as unknown as { flutter_inappwebview?: unknown }).flutter_inappwebview !== undefined;
  const hasFlutterUserAgent = userAgent.includes('flutter') || userAgent.includes('inappwebview');
  
  return hasFlutterWebView || hasFlutterUserAgent;
};

export const sendMessageToFlutter = (message: Record<string, unknown>) => {
  if (isFlutterWebView()) {
    try {
      (window as unknown as { flutter_inappwebview: { callHandler: (name: string, data: Record<string, unknown>) => void } }).flutter_inappwebview.callHandler('webViewMessage', message);
      console.log('✅ Message sent to Flutter:', message);
    } catch (error) {
      console.error('❌ Failed to send message to Flutter:', error);
    }
  }
};

export const sendPaymentResultToFlutter = (result: {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  amount?: number;
  error?: string;
}) => {
  sendMessageToFlutter({
    type: 'payment_result',
    ...result,
    timestamp: new Date().toISOString()
  });
};

// Enhanced payment polling for WebView
export class PaymentPoller {
  private intervalId: NodeJS.Timeout | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private isPolling = false;
  private pollCount = 0;
  private maxPollCount = 100; // Maximum number of polls (5 minutes at 3s intervals)

  constructor(
    private orderId: string,
    private initialPaymentId: string | null,
    private onSuccess: (data: Record<string, unknown>) => void,
    private onFailure: (error: string) => void,
    private onTimeout: () => void
  ) {}

  startPolling(intervalMs: number = 3000, timeoutMs: number = 300000) {
    if (this.isPolling) return;

    this.isPolling = true;
    this.pollCount = 0;
    console.log(`🔄 Starting payment polling for order ${this.orderId}`);

    this.intervalId = setInterval(async () => {
      this.pollCount++;
      
      try {
        // Build query parameters
        const params = new URLSearchParams({
          order_id: this.orderId
        });
        
        // Add payment_id if available
        if (this.initialPaymentId) {
          params.append('payment_id', this.initialPaymentId);
        }

        const response = await fetch(
          `/api/razorpay/payment-status?${params.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.status === 'completed') {
            console.log('✅ Payment completed via polling:', data);
            this.stopPolling();
            this.onSuccess(data);
            return;
          }
          
          if (data.status === 'failed') {
            console.log('❌ Payment failed via polling:', data);
            this.stopPolling();
            this.onFailure(data.message || 'Payment failed');
            return;
          }

          // Update payment ID if we received one
          if (data.payment_id && !this.initialPaymentId) {
            this.initialPaymentId = data.payment_id;
            console.log('📝 Updated payment ID:', data.payment_id);
          }

          // Log polling progress
          if (this.pollCount % 10 === 0) {
            console.log(`🔄 Polling in progress... (${this.pollCount}/${this.maxPollCount})`);
          }
        } else {
          console.warn(`⚠️ Payment status check failed: ${response.status}`);
        }
      } catch (error) {
        console.error('Payment polling error:', error);
        
        // If we've had too many errors, stop polling
        if (this.pollCount > 20) {
          console.error('❌ Too many polling errors, stopping...');
          this.stopPolling();
          this.onFailure('Payment status check failed');
        }
      }

      // Safety check - stop if we've polled too many times
      if (this.pollCount >= this.maxPollCount) {
        console.log('⏰ Maximum poll count reached');
        this.stopPolling();
        this.onTimeout();
      }
    }, intervalMs);

    // Timeout after specified duration
    this.timeoutId = setTimeout(() => {
      console.log('⏰ Payment polling timeout');
      this.stopPolling();
      this.onTimeout();
    }, timeoutMs);
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.isPolling = false;
    console.log('🛑 Payment polling stopped');
  }

  isActive(): boolean {
    return this.isPolling;
  }
}

// WebView-specific Razorpay configuration
export const getWebViewRazorpayConfig = () => {
  return {
    modal: {
      backdropclose: false,
      escape: false,
      handleback: false,
    },
    theme: {
      color: '#3B82F6',
      backdrop_color: 'rgba(0,0,0,0.8)',
    },
    retry: {
      enabled: true,
      max_count: 3,
    },
    callback_url: `${window.location.origin}/payment-callback`,
  };
};

// Payment completion handler for WebView
export const handleWebViewPaymentCompletion = async (
  paymentId: string,
  orderId: string,
  amount: number,
  partnerId: string
) => {
  try {
    console.log('🔄 Handling WebView payment completion:', { paymentId, orderId, amount });

    // Send success message to Flutter
    sendPaymentResultToFlutter({
      success: true,
      paymentId,
      orderId,
      amount,
    });

    // Verify payment on server
    const response = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: 'webview_verification', // Special signature for WebView
        partnerId,
        amount,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Payment verified successfully:', data);
      
      // Refresh wallet balance
      window.location.reload();
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (error) {
    console.error('❌ WebView payment completion error:', error);
    
    // Send failure message to Flutter
    sendPaymentResultToFlutter({
      success: false,
      error: error instanceof Error ? error.message : 'Payment verification failed',
    });
  }
};
