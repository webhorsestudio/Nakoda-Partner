#!/usr/bin/env node

/**
 * Payment Gateway Error Logging Demonstration Script
 * This script demonstrates the complete payment gateway error logging system
 * including request/response logs, error analysis, and debugging tools.
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Utility functions
const logMessage = (message, color = 'white') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  logMessage('\n' + '='.repeat(80), 'cyan');
  logMessage(`  ${title}`, 'bright');
  logMessage('='.repeat(80), 'cyan');
};

const logSubSection = (title) => {
  logMessage('\n' + '-'.repeat(60), 'yellow');
  logMessage(`  ${title}`, 'yellow');
  logMessage('-'.repeat(60), 'yellow');
};

// Payment Gateway Error Examples
const paymentErrorExamples = {
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
  }
};

// Display functions
function displayRequestLog(log) {
  logSubSection("REQUEST LOG");
  logMessage(`Timestamp: ${log.timestamp}`, 'cyan');
  logMessage(`Type: ${log.type}`, 'green');
  logMessage(`Level: ${log.level}`, 'yellow');
  logMessage(`Message: ${log.message}`, 'white');
  logMessage(`Request ID: ${log.requestId}`, 'magenta');
  
  if (log.data) {
    logMessage('\nRequest Data:', 'bright');
    logMessage(JSON.stringify(log.data, null, 2), 'white');
  }
}

function displayResponseLog(log) {
  logSubSection("RESPONSE LOG");
  logMessage(`Timestamp: ${log.timestamp}`, 'cyan');
  logMessage(`Type: ${log.type}`, 'green');
  logMessage(`Level: ${log.level}`, 'yellow');
  logMessage(`Message: ${log.message}`, 'white');
  logMessage(`Request ID: ${log.requestId}`, 'magenta');
  
  if (log.data) {
    logMessage('\nResponse Data:', 'bright');
    logMessage(JSON.stringify(log.data, null, 2), 'white');
  }
}

function displayErrorLog(log) {
  logSubSection("ERROR LOG");
  logMessage(`Timestamp: ${log.timestamp}`, 'cyan');
  logMessage(`Type: ${log.type}`, 'red');
  logMessage(`Level: ${log.level}`, 'red');
  logMessage(`Message: ${log.message}`, 'red');
  logMessage(`Request ID: ${log.requestId}`, 'magenta');
  
  if (log.data) {
    logMessage('\nError Data:', 'bright');
    logMessage(JSON.stringify(log.data, null, 2), 'red');
  }
}

function displaySuccessLog(log) {
  logSubSection("SUCCESS LOG");
  logMessage(`Timestamp: ${log.timestamp}`, 'cyan');
  logMessage(`Type: ${log.type}`, 'green');
  logMessage(`Level: ${log.level}`, 'green');
  logMessage(`Message: ${log.message}`, 'green');
  logMessage(`Request ID: ${log.requestId}`, 'magenta');
  
  if (log.data) {
    logMessage('\nSuccess Data:', 'bright');
    logMessage(JSON.stringify(log.data, null, 2), 'green');
  }
}

function displayCallbackLog(log) {
  logSubSection("CALLBACK LOG");
  logMessage(`Timestamp: ${log.timestamp}`, 'cyan');
  logMessage(`Type: ${log.type}`, 'blue');
  logMessage(`Level: ${log.level}`, 'blue');
  logMessage(`Message: ${log.message}`, 'blue');
  logMessage(`Request ID: ${log.requestId}`, 'magenta');
  
  if (log.data) {
    logMessage('\nCallback Data:', 'bright');
    logMessage(JSON.stringify(log.data, null, 2), 'blue');
  }
}

// Main demonstration function
function demonstratePaymentGatewayLogging() {
  logSection("PAYMENT GATEWAY ERROR LOGGING SYSTEM DEMONSTRATION");
  
  logMessage('\nThis script demonstrates the complete payment gateway error logging system', 'white');
  logMessage('including request/response logs, error analysis, and debugging tools.', 'white');
  
  // 1. Session Expired Error Example
  logSection("1. SESSION EXPIRED ERROR EXAMPLE");
  logMessage('This is the most common error in payment gateway integration.', 'yellow');
  logMessage('It occurs when the payment gateway rejects the request due to various issues.', 'yellow');
  
  displayRequestLog(paymentErrorExamples.sessionExpired.request);
  displayResponseLog(paymentErrorExamples.sessionExpired.response);
  displayErrorLog(paymentErrorExamples.sessionExpired.error);
  
  // 2. Network Error Example
  logSection("2. NETWORK ERROR EXAMPLE");
  logMessage('Network errors occur when there are connectivity issues with the payment gateway.', 'yellow');
  
  displayRequestLog(paymentErrorExamples.networkError.request);
  displayErrorLog(paymentErrorExamples.networkError.error);
  
  // 3. Validation Error Example
  logSection("3. VALIDATION ERROR EXAMPLE");
  logMessage('Validation errors occur when input data fails validation checks.', 'yellow');
  
  displayRequestLog(paymentErrorExamples.validationError.request);
  displayErrorLog(paymentErrorExamples.validationError.error);
  
  // 4. Success Flow Example
  logSection("4. SUCCESS FLOW EXAMPLE");
  logMessage('This shows a complete successful payment flow from request to callback.', 'green');
  
  displayRequestLog(paymentErrorExamples.successFlow.request);
  displayResponseLog(paymentErrorExamples.successFlow.response);
  displaySuccessLog(paymentErrorExamples.successFlow.success);
  displayCallbackLog(paymentErrorExamples.successFlow.callback);
  
  // 5. Error Analysis
  logSection("5. ERROR ANALYSIS FEATURES");
  logMessage('The system provides intelligent error analysis with:', 'white');
  logMessage('• Automated pattern detection', 'green');
  logMessage('• Common error identification', 'green');
  logMessage('• Intelligent recommendations', 'green');
  logMessage('• Real-time error monitoring', 'green');
  logMessage('• Export functionality for external analysis', 'green');
  
  // 6. Common Error Solutions
  logSection("6. COMMON ERROR SOLUTIONS");
  logMessage('Session Expired Solutions:', 'yellow');
  logMessage('• Check system clock synchronization', 'white');
  logMessage('• Verify timestamp generation', 'white');
  logMessage('• Validate signature generation', 'white');
  logMessage('• Check merchant credentials', 'white');
  logMessage('• Verify callback URL accessibility', 'white');
  
  logMessage('\nNetwork Error Solutions:', 'yellow');
  logMessage('• Check network connectivity', 'white');
  logMessage('• Verify payment gateway URLs', 'white');
  logMessage('• Check firewall settings', 'white');
  logMessage('• Test with different endpoints', 'white');
  
  logMessage('\nValidation Error Solutions:', 'yellow');
  logMessage('• Review input validation rules', 'white');
  logMessage('• Check data sanitization', 'white');
  logMessage('• Verify required fields', 'white');
  logMessage('• Test with different data types', 'white');
  
  // 7. Admin Interface Features
  logSection("7. ADMIN INTERFACE FEATURES");
  logMessage('The admin interface provides:', 'white');
  logMessage('• Real-time log viewing with auto-refresh', 'green');
  logMessage('• Advanced filtering by type, level, and request ID', 'green');
  logMessage('• Detailed log inspection with modal popup', 'green');
  logMessage('• Export functionality for log analysis', 'green');
  logMessage('• Error analysis dashboard with recommendations', 'green');
  logMessage('• Test log generation for debugging scenarios', 'green');
  
  // 8. Usage Instructions
  logSection("8. USAGE INSTRUCTIONS");
  logMessage('To use the payment gateway error logging system:', 'white');
  logMessage('1. Navigate to /admin/payment-logs', 'cyan');
  logMessage('2. View real-time payment logs', 'cyan');
  logMessage('3. Analyze error patterns using the Error Analysis dashboard', 'cyan');
  logMessage('4. Export logs for external analysis', 'cyan');
  logMessage('5. Use test log generation for debugging', 'cyan');
  
  // 9. File Structure
  logSection("9. FILE STRUCTURE");
  logMessage('The error logging system consists of:', 'white');
  logMessage('• src/utils/paymentLogger.ts - Core logging utility', 'green');
  logMessage('• src/components/admin/payment-logs/PaymentLogViewer.tsx - Log viewer component', 'green');
  logMessage('• src/components/admin/payment-logs/ErrorAnalysis.tsx - Error analysis component', 'green');
  logMessage('• src/app/admin/payment-logs/page.tsx - Admin interface page', 'green');
  logMessage('• src/utils/paymentErrorExamples.ts - Error examples and patterns', 'green');
  logMessage('• docs/payment-gateway-error-logging.md - Complete documentation', 'green');
  
  // 10. Integration Points
  logSection("10. INTEGRATION POINTS");
  logMessage('The logging system integrates with:', 'white');
  logMessage('• PaymentService - Enhanced with comprehensive logging', 'green');
  logMessage('• Payment API routes - Request/response tracking', 'green');
  logMessage('• Wallet components - Transaction logging', 'green');
  logMessage('• Admin dashboard - Real-time monitoring', 'green');
  
  logSection("DEMONSTRATION COMPLETE");
  logMessage('The payment gateway error logging system is now fully implemented', 'green');
  logMessage('and ready for production use. Access the admin interface at /admin/payment-logs', 'green');
  logMessage('to monitor and debug payment gateway operations in real-time.', 'green');
}

// Run the demonstration
if (require.main === module) {
  demonstratePaymentGatewayLogging();
}

module.exports = {
  demonstratePaymentGatewayLogging,
  paymentErrorExamples
};
