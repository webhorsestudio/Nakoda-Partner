// Payment Gateway Service
import { 
  CheckoutRequest, 
  TransactionStatusRequest, 
  RefundRequest, 
  TransactionStatusResponse, 
  RefundResponse, 
  PaymentResult,
  CallbackData 
} from '@/types/payment';
import { getPaymentConfig, API_ENDPOINTS } from '@/config/payment';
import { 
  generateSignature, 
  validateAmount, 
  validateMerchantTxnId, 
  validateCustomerInfo,
  isSuccessStatus,
  isPendingStatus,
  getErrorMessage 
} from '@/utils/paymentUtils';

export class PaymentService {
  private config: ReturnType<typeof getPaymentConfig>;

  constructor() {
    this.config = getPaymentConfig();
    console.log('PaymentService config:', {
      baseUrl: this.config.baseUrl,
      merchantId: this.config.merchantId,
      clientId: this.config.clientId,
      merchantKey: this.config.merchantKey ? 'SET' : 'NOT SET'
    });
  }

  /**
   * Initiate payment checkout
   * @param request - Checkout request object
   * @returns Payment result with redirect URL or error
   */
  async initiateCheckout(request: CheckoutRequest): Promise<PaymentResult> {
    try {
      // Validate amount
      const amountValidation = validateAmount(request.merchantTxnAmount);
      if (!amountValidation.valid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: amountValidation.error!,
            description: 'Amount validation failed',
            category: 'VALIDATION'
          }
        };
      }

      // Validate merchant transaction ID
      const txnIdValidation = validateMerchantTxnId(request.merchantTxnId);
      if (!txnIdValidation.valid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: txnIdValidation.error!,
            description: 'Transaction ID validation failed',
            category: 'VALIDATION'
          }
        };
      }

      // Validate timestamp
      const currentTime = Math.floor(Date.now() / 1000);
      const requestTime = request.timestamp || 0;
      const timeDiff = currentTime - requestTime;
      
      console.log('Timestamp validation:', {
        requestTimestamp: request.timestamp,
        currentTime,
        timeDifference: timeDiff,
        isValidTime: timeDiff >= 0 && timeDiff <= 300
      });

      // Check if timestamp is too old (more than 5 minutes)
      if (timeDiff > 300) {
        return {
          success: false,
          error: {
            code: 'TIMESTAMP_TOO_OLD',
            message: 'Request timestamp is too old',
            description: 'The request timestamp is more than 5 minutes old. Please try again.',
            category: 'VALIDATION'
          }
        };
      }

      // Validate customer info if provided
      const customerInfo = {
        customerId: request.customerId,
        customerName: request.customerName,
        customerEmailId: request.customerEmailId,
        customerMobileNo: request.customerMobileNo,
        customerStreetAddress: request.customerStreetAddress,
        customerCity: request.customerCity,
        customerState: request.customerState,
        customerPIN: request.customerPIN,
        customerCountry: request.customerCountry,
      };

      const customerValidation = validateCustomerInfo(customerInfo);
      if (!customerValidation.valid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: customerValidation.error!,
            description: 'Customer information validation failed',
            category: 'VALIDATION'
          }
        };
      }

      // Prepare form data for POST request
      const formData = new URLSearchParams();
      Object.entries(request).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, String(value));
        }
      });

      // Make API call to Axis PG
      console.log('Making API call to:', `${this.config.baseUrl}${API_ENDPOINTS.CHECKOUT}`);
      console.log('Request details:', {
        merchantId: request.merchantId,
        merchantTxnId: request.merchantTxnId,
        amount: request.merchantTxnAmount,
        timestamp: request.timestamp,
        signature: request.signature,
        callbackUrl: request.callbackUrl,
        formDataSize: formData.toString().length
      });
      console.log('Form data:', formData.toString());
      
      const response = await fetch(`${this.config.baseUrl}${API_ENDPOINTS.CHECKOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Origin': this.config.baseUrl,
          'Pragma': 'no-cache',
          'Referer': `${this.config.baseUrl}/payment/v1/mock/checkout`,
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Upgrade-Insecure-Requests': '1',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        },
        body: formData.toString(),
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

      // Read response text once
      const responseText = await response.text();
      console.log('Response text length:', responseText.length);
      console.log('Response preview:', responseText.substring(0, 200) + '...');

      if (!response.ok) {
        console.error('API Error response:', responseText);
        
        return {
          success: false,
          error: {
            code: 'API_ERROR',
            message: `HTTP ${response.status}: ${response.statusText}`,
            description: `Failed to initiate payment checkout. Response: ${responseText}`,
            category: 'TECHNICAL'
          }
        };
      }

      // For checkout, Axis PG returns an HTML page that contains the payment form
      console.log('Response analysis:', {
        responseLength: responseText.length,
        hasForm: responseText.includes('form'),
        hasInput: responseText.includes('input'),
        hasButton: responseText.includes('button'),
        hasPayment: responseText.includes('payment'),
        hasCheckout: responseText.includes('checkout'),
        hasSessionExpired: responseText.includes('Session Expired'),
        hasError: responseText.includes('error'),
        responseStart: responseText.substring(0, 200)
      });

      // Check if response contains session expiry or error messages
      if (responseText.includes('Session Expired') || responseText.includes('session expired') || 
          responseText.includes('SPG-0006') || responseText.includes('Invalid session')) {
        console.error('Session expiry detected in response:', {
          responseLength: responseText.length,
          responsePreview: responseText.substring(0, 500),
          containsSessionExpired: responseText.includes('Session Expired'),
          containsSessionExpiredLower: responseText.includes('session expired'),
          containsSPG0006: responseText.includes('SPG-0006'),
          containsInvalidSession: responseText.includes('Invalid session')
        });
        
        return {
          success: false,
          error: {
            code: 'SESSION_EXPIRED',
            message: 'Payment session expired',
            description: 'The payment session has expired on the payment gateway. This could be due to timestamp validation or session timeout.',
            category: 'TECHNICAL'
          }
        };
      }

      // Log the actual payment form content for debugging
      console.log('Payment form content analysis:', {
        responseLength: responseText.length,
        containsFormTag: responseText.includes('<form'),
        containsInputTag: responseText.includes('<input'),
        containsButtonTag: responseText.includes('<button'),
        containsSubmitTag: responseText.includes('<input type="submit"'),
        containsAction: responseText.includes('action='),
        containsMethod: responseText.includes('method='),
        containsSessionExpired: responseText.includes('Session Expired'),
        containsError: responseText.includes('error'),
        formStart: responseText.substring(responseText.indexOf('<form'), responseText.indexOf('<form') + 200),
        responseEnd: responseText.substring(responseText.length - 200)
      });

      // Check if response contains payment form (HTML with form elements)
      // A valid payment form should have multiple indicators
      const hasFormElements = responseText.includes('form') || 
                             responseText.includes('input') ||
                             responseText.includes('button') ||
                             responseText.includes('submit');
      
      const hasPaymentKeywords = responseText.includes('payment') || 
                                responseText.includes('checkout') ||
                                responseText.includes('amount') ||
                                responseText.includes('transaction');
      
      // If it has form elements OR payment keywords, and it's long enough, it's likely a payment form
      // Also check for HTML structure indicators
      const hasHtmlStructure = responseText.includes('<!DOCTYPE html>') || 
                              responseText.includes('<html') ||
                              responseText.includes('<body');
      
      const isPaymentForm = (hasFormElements || hasPaymentKeywords || hasHtmlStructure) && responseText.length > 1000;

      // Check for actual error pages (not payment forms)
      // Only consider it an error if it's a short response with specific error messages
      const isErrorPage = (responseText.includes('Session Expired') || 
                          responseText.includes('session expired') || 
                          responseText.includes('session-expired') || 
                          responseText.includes('SESSION_EXPIRED') ||
                          responseText.includes('Your session has expired') ||
                          responseText.includes('session has expired')) ||
                         (responseText.includes('error') && responseText.length < 1000 && !responseText.includes('form') && !responseText.includes('payment'));
      
      console.log('Payment form detection:', {
        hasFormElements,
        hasPaymentKeywords,
        hasHtmlStructure,
        responseLength: responseText.length,
        isPaymentForm,
        isErrorPage
      });

      // Priority 1: Check for payment form first (before error detection)
      if (isPaymentForm) {
        console.log('Payment form detected, returning success');
        return {
          success: true,
          html: responseText,
          transactionId: request.merchantTxnId,
          redirectUrl: `${this.config.baseUrl}${API_ENDPOINTS.CHECKOUT}`
        };
      }

      // Priority 2: Fallback - If it's HTML and long enough, treat as payment form
      if (responseText.includes('<!DOCTYPE html>') && responseText.length > 1000) {
        console.log('HTML response detected, treating as payment form (fallback)');
        return {
          success: true,
          html: responseText,
          transactionId: request.merchantTxnId,
          redirectUrl: `${this.config.baseUrl}${API_ENDPOINTS.CHECKOUT}`
        };
      }

      // Priority 3: Only then check for errors
      if (isErrorPage) {
        console.error('Error page detected in response:', {
          responseLength: responseText.length,
          responsePreview: responseText.substring(0, 500),
          requestTimestamp: request.timestamp,
          currentTimestamp: Math.floor(Date.now() / 1000),
          timeDifference: Math.floor(Date.now() / 1000) - (request.timestamp || 0)
        });
        
        return {
          success: false,
          error: {
            code: 'PAYMENT_ERROR',
            message: 'Payment gateway error',
            description: 'The payment gateway returned an error response.',
            category: 'TECHNICAL'
          }
        };
      }

      return {
        success: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: 'Invalid response from payment gateway',
          description: 'The payment gateway returned an unexpected response.',
          category: 'TECHNICAL'
        }
      };

    } catch (error) {
      console.error('Error initiating checkout:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred',
          description: error instanceof Error ? error.message : 'Unknown error',
          category: 'TECHNICAL'
        }
      };
    }
  }

  /**
   * Check transaction status
   * @param request - Transaction status request object
   * @returns Transaction status response
   */
  async checkTransactionStatus(request: TransactionStatusRequest): Promise<TransactionStatusResponse> {
    try {
      // Prepare request body
      const isProduction = process.env.NODE_ENV === 'production';
      let encData: string;
      
      if (isProduction && this.config.privateKey) {
        // Use JWT encryption for production
        const { createJWT } = await import('@/utils/paymentUtils');
        encData = createJWT(request, this.config.privateKey);
      } else {
        // Use simple JSON for sandbox/development
        encData = JSON.stringify(request);
      }

      const requestBody = {
        clientId: this.config.clientId,
        encData
      };

      const response = await fetch(`${this.config.baseUrl}${API_ENDPOINTS.TRANSACTION_STATUS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: TransactionStatusResponse = await response.json();
      return result;

    } catch (error) {
      console.error('Error checking transaction status:', error);
      throw error;
    }
  }

  /**
   * Process refund
   * @param request - Refund request object
   * @returns Refund response
   */
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // Validate refund amount
      const amountValidation = validateAmount(request.refundAmount);
      if (!amountValidation.valid) {
        throw new Error(amountValidation.error);
      }

      // Prepare request body
      const isProduction = process.env.NODE_ENV === 'production';
      let encData: string;
      
      if (isProduction && this.config.privateKey) {
        // Use JWT encryption for production
        const { createJWT } = await import('@/utils/paymentUtils');
        encData = createJWT(request, this.config.privateKey);
      } else {
        // Use simple JSON for sandbox/development
        encData = JSON.stringify(request);
      }

      const requestBody = {
        clientId: this.config.clientId,
        encData
      };

      const response = await fetch(`${this.config.baseUrl}${API_ENDPOINTS.REFUND}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: RefundResponse = await response.json();
      return result;

    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Verify callback signature
   * @param callbackData - Callback data received
   * @returns True if signature is valid
   */
  verifyCallbackSignature(callbackData: CallbackData): boolean {
    try {
      // Extract signature from callback data
      const { signature, ...dataToVerify } = callbackData;
      
      // Generate signature using callback-specific logic
      const generatedSignature = generateSignature(dataToVerify, this.config.merchantKey, true);
      
      console.log('Callback signature verification:', {
        received: signature,
        generated: generatedSignature,
        match: signature === generatedSignature
      });
      
      // Compare signatures
      return signature === generatedSignature;
    } catch (error) {
      console.error('Error verifying callback signature:', error);
      return false;
    }
  }

  /**
   * Process callback data
   * @param callbackData - Callback data received
   * @returns Processed callback result
   */
  processCallback(callbackData: CallbackData): PaymentResult {
    try {
      // Verify signature
      if (!this.verifyCallbackSignature(callbackData)) {
        return {
          success: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Invalid callback signature',
            description: 'The callback signature verification failed',
            category: 'AUTHENTICATION'
          }
        };
      }

      // Check status
      if (isSuccessStatus(callbackData.statusCode)) {
        return {
          success: true,
          transactionId: callbackData.merchantTxnId,
          referenceId: callbackData.txnReferenceId,
          amount: callbackData.amount,
          currency: callbackData.currency,
          status: 'SUCCESS'
        };
      } else if (isPendingStatus(callbackData.statusCode)) {
        return {
          success: true,
          transactionId: callbackData.merchantTxnId,
          referenceId: callbackData.txnReferenceId,
          amount: callbackData.amount,
          currency: callbackData.currency,
          status: 'PENDING'
        };
      } else {
        const errorInfo = getErrorMessage(callbackData.statusCode);
        return {
          success: false,
          transactionId: callbackData.merchantTxnId,
          referenceId: callbackData.txnReferenceId,
          amount: callbackData.amount,
          currency: callbackData.currency,
          status: 'FAILED',
          error: {
            code: callbackData.statusCode,
            message: errorInfo.message,
            description: callbackData.errorDescription || errorInfo.message,
            category: errorInfo.category as 'VALIDATION' | 'AUTHENTICATION' | 'AUTHORIZATION' | 'BUSINESS' | 'TECHNICAL'
          }
        };
      }
    } catch (error) {
      console.error('Error processing callback:', error);
      return {
        success: false,
        error: {
          code: 'CALLBACK_ERROR',
          message: 'Error processing callback',
          description: error instanceof Error ? error.message : 'Unknown error',
          category: 'TECHNICAL'
        }
      };
    }
  }

  /**
   * Get payment modes available
   * @returns Array of available payment modes
   */
  getAvailablePaymentModes() {
    return [
      { code: 'CC', name: 'Credit Card' },
      { code: 'DC', name: 'Debit Card' },
      { code: 'UPI', name: 'UPI' },
      { code: 'NB', name: 'Net Banking' },
      { code: 'WALLET', name: 'Wallet' },
    ];
  }

  /**
   * Get banks for net banking
   * @returns Array of available banks
   */
  getAvailableBanks(): Array<{ id: string; name: string; code: string }> {
    return [
      { id: '0005', name: 'AXIS Bank', code: '0005' },
      { id: '0020', name: 'HDFC Bank', code: '0020' },
      { id: '0021', name: 'ICICI Bank', code: '0021' },
      { id: '0038', name: 'State Bank of India', code: '0038' },
      { id: '0046', name: 'YES Bank', code: '0046' },
      { id: '0031', name: 'Kotak Mahindra Bank', code: '0031' },
      { id: '0006', name: 'Bank of Baroda', code: '0006' },
      { id: '0007', name: 'Bank of India', code: '0007' },
      { id: '0043', name: 'Union Bank of India', code: '0043' },
      { id: '0042', name: 'UCO Bank', code: '0042' },
    ];
  }

  /**
   * Get wallets available
   * @returns Array of available wallets
   */
  getAvailableWallets(): Array<{ code: string; name: string }> {
    return [
      { code: 'FREECHARGE', name: 'Freecharge' },
      { code: 'PAYTM', name: 'Paytm' },
      { code: 'AMAZON_PAY', name: 'Amazon Pay' },
      { code: 'AIRTEL_MONEY', name: 'Airtel Money' },
      { code: 'MOBILEWIK', name: 'Mobikwik' },
      { code: 'OLA_MONEY', name: 'Ola Money' },
      { code: 'JIO_MONEY', name: 'Jio Money' },
    ];
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
