// Payment Gateway Error Logging Utility
import { CheckoutRequest, CallbackData } from '@/types/payment';

export interface PaymentLogEntry {
  timestamp: string;
  type: 'REQUEST' | 'RESPONSE' | 'ERROR' | 'SUCCESS';
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  data?: Record<string, unknown>;
  requestId?: string;
  sessionId?: string;
}

export class PaymentLogger {
  private static logs: PaymentLogEntry[] = [];
  private static maxLogs = 1000;

  static log(entry: Omit<PaymentLogEntry, 'timestamp'>) {
    const logEntry: PaymentLogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    this.logs.unshift(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console output with proper formatting
    const logMessage = `[${logEntry.timestamp}] [${logEntry.level}] [${logEntry.type}] ${logEntry.message}`;
    
    switch (logEntry.level) {
      case 'ERROR':
        console.error(logMessage, logEntry.data);
        break;
      case 'WARN':
        console.warn(logMessage, logEntry.data);
        break;
      case 'DEBUG':
        console.debug(logMessage, logEntry.data);
        break;
      default:
        console.log(logMessage, logEntry.data);
    }
  }

  static logRequest(request: CheckoutRequest, requestId: string) {
    this.log({
      type: 'REQUEST',
      level: 'INFO',
      message: 'Payment checkout request initiated',
      requestId,
      data: {
        merchantId: request.merchantId,
        merchantTxnId: request.merchantTxnId,
        amount: request.merchantTxnAmount,
        currency: request.currency,
        timestamp: request.timestamp,
        callbackUrl: request.callbackUrl,
        customerInfo: {
          customerId: request.customerId,
          customerName: request.customerName,
          customerEmailId: request.customerEmailId,
          customerMobileNo: request.customerMobileNo
        },
        signature: request.signature ? 'GENERATED' : 'MISSING'
      }
    });
  }

  static logResponse(response: Response, responseText: string, requestId: string) {
    this.log({
      type: 'RESPONSE',
      level: 'INFO',
      message: 'Payment gateway response received',
      requestId,
      data: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 500),
        isSuccess: response.ok,
        contentType: response.headers.get('content-type'),
        hasSessionExpired: responseText.includes('Session Expired') || responseText.includes('session expired'),
        hasError: responseText.includes('error') || responseText.includes('Error'),
        hasForm: responseText.includes('<form') || responseText.includes('form'),
        hasPayment: responseText.includes('payment') || responseText.includes('Payment')
      }
    });
  }

  static logError(error: unknown, requestId: string, context: string) {
    this.log({
      type: 'ERROR',
      level: 'ERROR',
      message: `Payment gateway error in ${context}`,
      requestId,
      data: {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : String(error),
        context
      }
    });
  }

  static logCallback(callbackData: CallbackData, requestId: string) {
    this.log({
      type: 'RESPONSE',
      level: 'INFO',
      message: 'Payment callback received',
      requestId,
      data: {
        statusCode: callbackData.statusCode,
        statusMessage: callbackData.statusMessage,
        merchantTxnId: callbackData.merchantTxnId,
        txnReferenceId: callbackData.txnReferenceId,
        amount: callbackData.amount,
        currency: callbackData.currency,
        mode: callbackData.mode,
        subMode: callbackData.subMode,
        signature: callbackData.signature ? 'PRESENT' : 'MISSING',
        isSuccess: callbackData.statusCode === 'SPG-0000',
        isPending: callbackData.statusCode === 'SPG-0002'
      }
    });
  }

  static logSessionExpired(request: CheckoutRequest, responseText: string, requestId: string) {
    this.log({
      type: 'ERROR',
      level: 'ERROR',
      message: 'Session expired error detected',
      requestId,
      data: {
        requestTimestamp: request.timestamp,
        currentTimestamp: Date.now(),
        timeDifference: Date.now() - request.timestamp,
        responsePreview: responseText.substring(0, 1000),
        possibleCauses: [
          'Timestamp in future',
          'Timestamp too old',
          'Invalid signature',
          'Invalid merchant credentials',
          'Callback URL not accessible'
        ],
        requestData: {
          merchantId: request.merchantId,
          merchantTxnId: request.merchantTxnId,
          amount: request.merchantTxnAmount,
          timestamp: request.timestamp,
          signature: request.signature ? 'GENERATED' : 'MISSING'
        }
      }
    });
  }

  static logSignatureGeneration(data: Record<string, unknown>, signature: string, requestId: string) {
    this.log({
      type: 'REQUEST',
      level: 'DEBUG',
      message: 'Signature generation process',
      requestId,
      data: {
        inputData: data,
        generatedSignature: signature,
        signatureLength: signature.length,
        isHex: /^[0-9a-f]+$/i.test(signature)
      }
    });
  }

  static getLogs(filter?: { type?: string; level?: string; requestId?: string }) {
    if (!filter) return this.logs;
    
    return this.logs.filter(log => {
      if (filter.type && log.type !== filter.type) return false;
      if (filter.level && log.level !== filter.level) return false;
      if (filter.requestId && log.requestId !== filter.requestId) return false;
      return true;
    });
  }

  static getErrorLogs() {
    return this.getLogs({ level: 'ERROR' });
  }

  static getRequestLogs(requestId: string) {
    return this.getLogs({ requestId });
  }

  static clearLogs() {
    this.logs = [];
  }

  static exportLogs() {
    return {
      exportedAt: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs
    };
  }
}

// Export for use in other files
export default PaymentLogger;
