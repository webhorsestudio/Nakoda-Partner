// Payment Gateway Error Examples and Logs
// Based on actual testing and debugging sessions

export const paymentErrorExamples = {
  // Session Expired Error (Most Common)
  sessionExpired: {
    request: {
      timestamp: "2024-01-15T10:30:00.000Z",
      type: "REQUEST",
      level: "INFO",
      message: "Payment checkout request initiated",
      requestId: "TXN_1705312200000_ABC123",
      data: {
        merchantId: "MERec40511352",
        merchantTxnId: "TXN_1705312200000_ABC123",
        amount: 100,
        currency: "INR",
        timestamp: 1705312200000,
        callbackUrl: "https://your-domain.com/api/payment/callback",
        customerInfo: {
          customerId: "123",
          customerName: "Test User",
          customerEmailId: "test@example.com",
          customerMobileNo: "9999999999"
        },
        signature: "GENERATED"
      }
    },
    response: {
      timestamp: "2024-01-15T10:30:05.000Z",
      type: "RESPONSE",
      level: "ERROR",
      message: "Payment gateway response received",
      requestId: "TXN_1705312200000_ABC123",
      data: {
        status: 200,
        statusText: "OK",
        headers: {
          "content-type": "text/html; charset=utf-8",
          "content-length": "1024"
        },
        responseLength: 1024,
        responsePreview: "<!DOCTYPE html><html><head><title>Session Expired</title></head><body><h1>Session Expired</h1><p>Your session has expired. Please try again later.</p></body></html>",
        isSuccess: true,
        contentType: "text/html; charset=utf-8",
        hasSessionExpired: true,
        hasError: true,
        hasForm: false,
        hasPayment: false
      }
    },
    error: {
      timestamp: "2024-01-15T10:30:05.000Z",
      type: "ERROR",
      level: "ERROR",
      message: "Session expired error detected",
      requestId: "TXN_1705312200000_ABC123",
      data: {
        requestTimestamp: 1705312200000,
        currentTimestamp: 1705312205000,
        timeDifference: 5000,
        responsePreview: "<!DOCTYPE html><html><head><title>Session Expired</title></head><body><h1>Session Expired</h1><p>Your session has expired. Please try again later.</p></body></html>",
        possibleCauses: [
          "Timestamp in future",
          "Timestamp too old",
          "Invalid signature",
          "Invalid merchant credentials",
          "Callback URL not accessible"
        ],
        requestData: {
          merchantId: "MERec40511352",
          merchantTxnId: "TXN_1705312200000_ABC123",
          amount: 100,
          timestamp: 1705312200000,
          signature: "GENERATED"
        }
      }
    }
  },

  // Network Error
  networkError: {
    request: {
      timestamp: "2024-01-15T10:35:00.000Z",
      type: "REQUEST",
      level: "INFO",
      message: "Making API call to payment gateway",
      requestId: "TXN_1705312500000_DEF456",
      data: {
        url: "https://checkout.freecharge.in/payment/v1/checkout",
        method: "POST",
        formDataSize: 1024,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      }
    },
    error: {
      timestamp: "2024-01-15T10:35:10.000Z",
      type: "ERROR",
      level: "ERROR",
      message: "Payment gateway error in API call",
      requestId: "TXN_1705312500000_DEF456",
      data: {
        error: {
          name: "TypeError",
          message: "Failed to fetch",
          stack: "TypeError: Failed to fetch\n    at PaymentService.initiateCheckout"
        },
        context: "API call"
      }
    }
  },

  // Validation Error
  validationError: {
    request: {
      timestamp: "2024-01-15T10:40:00.000Z",
      type: "REQUEST",
      level: "INFO",
      message: "Payment checkout request initiated",
      requestId: "TXN_1705312800000_GHI789",
      data: {
        merchantId: "MERec40511352",
        merchantTxnId: "TXN_1705312800000_GHI789",
        amount: -50, // Invalid amount
        currency: "INR",
        timestamp: 1705312800000,
        callbackUrl: "https://your-domain.com/api/payment/callback",
        signature: "GENERATED"
      }
    },
    error: {
      timestamp: "2024-01-15T10:40:00.000Z",
      type: "ERROR",
      level: "ERROR",
      message: "Payment gateway error in Amount validation",
      requestId: "TXN_1705312800000_GHI789",
      data: {
        error: {
          name: "Error",
          message: "Amount must be at least ₹1",
          stack: "Error: Amount must be at least ₹1\n    at validateAmount"
        },
        context: "Amount validation"
      }
    }
  },

  // Signature Generation Error
  signatureError: {
    debug: {
      timestamp: "2024-01-15T10:45:00.000Z",
      type: "DEBUG",
      level: "DEBUG",
      message: "Signature generation process",
      requestId: "TXN_1705313100000_JKL012",
      data: {
        inputData: {
          merchantId: "MERec40511352",
          callbackUrl: "https://your-domain.com/api/payment/callback",
          merchantTxnId: "TXN_1705313100000_JKL012",
          merchantTxnAmount: 100,
          currency: "INR",
          timestamp: 1705313100000
        },
        generatedSignature: "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
        signatureLength: 48,
        isHex: true
      }
    }
  },

  // Successful Payment Flow
  successFlow: {
    request: {
      timestamp: "2024-01-15T10:50:00.000Z",
      type: "REQUEST",
      level: "INFO",
      message: "Payment checkout request initiated",
      requestId: "TXN_1705313400000_MNO345",
      data: {
        merchantId: "MERec40511352",
        merchantTxnId: "TXN_1705313400000_MNO345",
        amount: 100,
        currency: "INR",
        timestamp: 1705313400000,
        callbackUrl: "https://your-domain.com/api/payment/callback",
        customerInfo: {
          customerId: "123",
          customerName: "Test User",
          customerEmailId: "test@example.com",
          customerMobileNo: "9999999999"
        },
        signature: "GENERATED"
      }
    },
    response: {
      timestamp: "2024-01-15T10:50:05.000Z",
      type: "RESPONSE",
      level: "INFO",
      message: "Payment gateway response received",
      requestId: "TXN_1705313400000_MNO345",
      data: {
        status: 200,
        statusText: "OK",
        responseLength: 5000,
        responsePreview: "<!DOCTYPE html><html><head><title>Payment Gateway</title></head><body><form action=\"https://checkout.freecharge.in/payment/v1/checkout\" method=\"POST\"><input type=\"hidden\" name=\"merchantId\" value=\"MERec40511352\">...</form></body></html>",
        isSuccess: true,
        contentType: "text/html; charset=utf-8",
        hasSessionExpired: false,
        hasError: false,
        hasForm: true,
        hasPayment: true
      }
    },
    success: {
      timestamp: "2024-01-15T10:50:10.000Z",
      type: "SUCCESS",
      level: "INFO",
      message: "Payment completed successfully",
      requestId: "TXN_1705313400000_MNO345",
      data: {
        transactionId: "TXN_1705313400000_MNO345",
        referenceId: "REF_1705313400000_MNO345",
        amount: 100,
        status: "SUCCESS"
      }
    },
    callback: {
      timestamp: "2024-01-15T10:50:15.000Z",
      type: "RESPONSE",
      level: "INFO",
      message: "Payment callback received",
      requestId: "TXN_1705313400000_MNO345",
      data: {
        statusCode: "SPG-0000",
        statusMessage: "SUCCESS",
        merchantTxnId: "TXN_1705313400000_MNO345",
        txnReferenceId: "REF_1705313400000_MNO345",
        amount: 100,
        currency: "INR",
        mode: "UPI",
        subMode: "COLLECT",
        signature: "PRESENT",
        isSuccess: true,
        isPending: false
      }
    }
  },

  // Common Error Patterns
  commonErrors: {
    timestampInFuture: {
      error: "Timestamp is in the future",
      cause: "System clock ahead of actual time",
      solution: "Sync system clock or adjust timestamp generation"
    },
    timestampTooOld: {
      error: "Timestamp is too old",
      cause: "Request took too long to reach payment gateway",
      solution: "Reduce processing time or increase timestamp validity window"
    },
    invalidSignature: {
      error: "Invalid signature",
      cause: "Wrong field order or missing merchant key",
      solution: "Check signature generation algorithm and field ordering"
    },
    invalidMerchantId: {
      error: "Invalid merchant id",
      cause: "Wrong merchant ID or environment mismatch",
      solution: "Verify merchant credentials and environment configuration"
    },
    callbackUrlNotAccessible: {
      error: "Callback URL not accessible",
      cause: "Using localhost or private IP for callback",
      solution: "Use public URL for callback endpoint"
    }
  }
};

export default paymentErrorExamples;
