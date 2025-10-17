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

export const isFlutterWebView = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (window as unknown as { flutter_inappwebview?: unknown }).flutter_inappwebview !== undefined;
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

  constructor(
    private orderId: string,
    private paymentId: string,
    private onSuccess: (data: Record<string, unknown>) => void,
    private onFailure: (error: string) => void,
    private onTimeout: () => void
  ) {}

  startPolling(intervalMs: number = 3000, timeoutMs: number = 300000) {
    if (this.isPolling) return;

    this.isPolling = true;
    console.log(`🔄 Starting payment polling for ${this.paymentId}`);

    this.intervalId = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/razorpay/payment-status?payment_id=${this.paymentId}&order_id=${this.orderId}`,
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
        }
      } catch (error) {
        console.error('Payment polling error:', error);
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
