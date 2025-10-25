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

// Flutter Native Session Backup System
export const initializeFlutterSessionBackup = () => {
  if (typeof window === 'undefined') return;
  
  console.log('🔧 Initializing Flutter native session backup...');
  
  // Check if we're in Flutter WebView
  if (isFlutterWebView()) {
    console.log('✅ Flutter WebView detected, setting up native session backup');
    
    // Request existing session from Flutter immediately
    requestSessionFromFlutter();
    
    // Set up periodic session backup
    setInterval(() => {
      const token = localStorage.getItem('auth-token');
      if (token) {
        backupSessionToFlutter(token);
      }
    }, 5000); // Backup every 5 seconds
    
    // Backup session on any storage change
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key: string, value: string) {
      originalSetItem.call(this, key, value);
      if (key === 'auth-token') {
        console.log('🔄 Token updated, backing up to Flutter...');
        backupSessionToFlutter(value);
      }
    };
    
    console.log('✅ Flutter session backup system initialized');
  } else {
    console.log('🌐 Not in Flutter WebView, skipping native backup');
  }
};

// Request session from Flutter
export const requestSessionFromFlutter = () => {
  if (!isFlutterWebView()) return;
  
  try {
    console.log('📡 Requesting session from Flutter...');
    (window as unknown as { flutter_inappwebview: { callHandler: (name: string, data: Record<string, unknown>) => void } }).flutter_inappwebview.callHandler('webViewMessage', {
      type: 'request_session',
      timestamp: new Date().toISOString(),
      source: 'web_app'
    });
  } catch (error) {
    console.warn('⚠️ Failed to request session from Flutter:', error);
  }
};

// Backup session to Flutter
export const backupSessionToFlutter = (token: string) => {
  if (!isFlutterWebView()) return;
  
  try {
    console.log('💾 Backing up session to Flutter...');
    (window as unknown as { flutter_inappwebview: { callHandler: (name: string, data: Record<string, unknown>) => void } }).flutter_inappwebview.callHandler('webViewMessage', {
      type: 'backup_session',
      token: token,
      timestamp: new Date().toISOString(),
      source: 'web_app'
    });
  } catch (error) {
    console.warn('⚠️ Failed to backup session to Flutter:', error);
  }
};

// Restore session from Flutter
export const restoreSessionFromFlutter = (token: string) => {
  console.log('🔄 Restoring session from Flutter...');
  
  // Store in all possible locations
  localStorage.setItem('auth-token', token);
  sessionStorage.setItem('auth-token', token);
  
  // Set cookies
  const cookieExpiry = 7 * 24 * 60 * 60; // 7 days
  const isSecure = window.location.protocol === 'https:';
  
  document.cookie = `auth-token=${token}; path=/; max-age=${cookieExpiry}; SameSite=Lax; ${isSecure ? 'Secure' : ''}`;
  document.cookie = `webview-auth-token=${token}; path=/; max-age=${cookieExpiry}; SameSite=None; ${isSecure ? 'Secure' : ''}`;
  
  console.log('✅ Session restored from Flutter to all storage locations');
  
  // Refresh the page to apply the restored session
  setTimeout(() => {
    window.location.reload();
  }, 100);
};

// Enhanced Flutter WebView Detection
export const isFlutterWebView = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for Flutter WebView indicators
  const hasFlutterWebView = (window as unknown as { flutter_inappwebview?: unknown }).flutter_inappwebview !== undefined;
  const hasFlutterUserAgent = userAgent.includes('flutter') || userAgent.includes('inappwebview');
  const hasWvUserAgent = userAgent.includes('wv'); // Android WebView
  const hasWebViewUserAgent = userAgent.includes('webview'); // iOS WebView
  
  // Additional Flutter-specific checks
  const hasFlutterWindow = !!(window as unknown as { flutter_inappwebview?: { callHandler?: unknown } }).flutter_inappwebview?.callHandler;
  
  const isFlutter = hasFlutterWebView || hasFlutterUserAgent || hasFlutterWindow;
  const isWebView = hasWvUserAgent || hasWebViewUserAgent;
  
  console.log('🔍 WebView Detection:', {
    userAgent: userAgent.substring(0, 100) + '...',
    hasFlutterWebView,
    hasFlutterUserAgent,
    hasFlutterWindow,
    hasWvUserAgent,
    hasWebViewUserAgent,
    isFlutter,
    isWebView,
    finalResult: isFlutter || isWebView
  });
  
  return isFlutter || isWebView;
};

// Enhanced WebView Session Recovery with Flutter Integration
export const initializeWebViewSessionRecovery = () => {
  if (typeof window === 'undefined') return;
  
  console.log('🔧 Initializing enhanced WebView session recovery...');
  
  // Set up Flutter message listener
  if (isFlutterWebView()) {
    try {
      // Listen for Flutter messages
      (window as unknown as { flutter_inappwebview: { addEventListener: (event: string, callback: (data: Record<string, unknown>) => void) => void } }).flutter_inappwebview.addEventListener('message', (data: Record<string, unknown>) => {
        console.log('📨 Received message from Flutter:', data);
        
        if (data.type === 'restore_session' && data.token) {
          console.log('🔄 Restoring session from Flutter...');
          restoreSessionFromFlutter(data.token as string);
        }
      });
      
      console.log('✅ Flutter message listener initialized');
    } catch (error) {
      console.warn('⚠️ Failed to initialize Flutter message listener:', error);
    }
  }
  
  // Set up storage event listeners for cross-tab synchronization
  window.addEventListener('storage', (event) => {
    if (event.key === 'auth-token' && event.newValue) {
      console.log('🔄 Auth token updated via storage event');
      backupSessionToFlutter(event.newValue);
    }
  });
  
  // Set up beforeunload event to backup session before page unload
  window.addEventListener('beforeunload', () => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      console.log('🔄 Page unloading, backing up session to Flutter...');
      backupSessionToFlutter(token);
    }
  });
  
  console.log('✅ Enhanced WebView session recovery initialized');
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
