#!/usr/bin/env node

/**
 * Test Script for Payment Gateway Error Logging
 * This script tests the payment gateway error logging system
 * by simulating various error scenarios and logging them.
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

const log = (message, color = 'white') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  log('\n' + '='.repeat(80), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(80), 'cyan');
};

const logSubSection = (title) => {
  log('\n' + '-'.repeat(60), 'yellow');
  log(`  ${title}`, 'yellow');
  log('-'.repeat(60), 'yellow');
};

// Simulate PaymentLogger functionality
class MockPaymentLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(entry) {
    const logEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    this.logs.unshift(logEntry);
    
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

  logRequest(request, requestId) {
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
        customerInfo: request.customerInfo,
        signature: request.signature ? 'GENERATED' : 'MISSING'
      }
    });
  }

  logResponse(response, responseText, requestId) {
    this.log({
      type: 'RESPONSE',
      level: 'INFO',
      message: 'Payment gateway response received',
      requestId,
      data: {
        status: response.status,
        statusText: response.statusText,
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 500),
        isSuccess: response.ok,
        hasSessionExpired: responseText.includes('Session Expired') || responseText.includes('session expired'),
        hasError: responseText.includes('error') || responseText.includes('Error'),
        hasForm: responseText.includes('<form') || responseText.includes('form'),
        hasPayment: responseText.includes('payment') || responseText.includes('Payment')
      }
    });
  }

  logError(error, requestId, context) {
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
        } : error,
        context
      }
    });
  }

  logSessionExpired(request, responseText, requestId) {
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

  getLogs(filter) {
    if (!filter) return this.logs;
    
    return this.logs.filter(log => {
      if (filter.type && log.type !== filter.type) return false;
      if (filter.level && log.level !== filter.level) return false;
      if (filter.requestId && log.requestId !== filter.requestId) return false;
      return true;
    });
  }

  getErrorLogs() {
    return this.getLogs({ level: 'ERROR' });
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs() {
    return {
      exportedAt: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs
    };
  }
}

// Test scenarios
const testScenarios = {
  sessionExpired: {
    name: "Session Expired Error",
    description: "Simulates a session expired error from the payment gateway",
    request: {
      merchantId: "MERec40511352",
      merchantTxnId: "TXN_TEST_SESSION_EXPIRED",
      merchantTxnAmount: 100,
      currency: "INR",
      timestamp: Date.now(),
      callbackUrl: "https://your-domain.com/api/payment/callback",
      customerInfo: {
        customerId: "123",
        customerName: "Test User",
        customerEmailId: "test@example.com",
        customerMobileNo: "9999999999"
      },
      signature: "test_signature_123"
    },
    response: {
      status: 200,
      statusText: "OK",
      text: "<!DOCTYPE html><html><head><title>Session Expired</title></head><body><h1>Session Expired</h1><p>Your session has expired. Please try again later.</p></body></html>"
    }
  },

  networkError: {
    name: "Network Error",
    description: "Simulates a network connectivity error",
    request: {
      merchantId: "MERec40511352",
      merchantTxnId: "TXN_TEST_NETWORK_ERROR",
      merchantTxnAmount: 100,
      currency: "INR",
      timestamp: Date.now(),
      callbackUrl: "https://your-domain.com/api/payment/callback",
      customerInfo: {
        customerId: "123",
        customerName: "Test User",
        customerEmailId: "test@example.com",
        customerMobileNo: "9999999999"
      },
      signature: "test_signature_456"
    },
    error: new Error("Failed to fetch")
  },

  validationError: {
    name: "Validation Error",
    description: "Simulates a validation error for invalid amount",
    request: {
      merchantId: "MERec40511352",
      merchantTxnId: "TXN_TEST_VALIDATION_ERROR",
      merchantTxnAmount: -50, // Invalid amount
      currency: "INR",
      timestamp: Date.now(),
      callbackUrl: "https://your-domain.com/api/payment/callback",
      customerInfo: {
        customerId: "123",
        customerName: "Test User",
        customerEmailId: "test@example.com",
        customerMobileNo: "9999999999"
      },
      signature: "test_signature_789"
    },
    error: new Error("Amount must be at least ₹1")
  },

  successFlow: {
    name: "Success Flow",
    description: "Simulates a successful payment flow",
    request: {
      merchantId: "MERec40511352",
      merchantTxnId: "TXN_TEST_SUCCESS",
      merchantTxnAmount: 100,
      currency: "INR",
      timestamp: Date.now(),
      callbackUrl: "https://your-domain.com/api/payment/callback",
      customerInfo: {
        customerId: "123",
        customerName: "Test User",
        customerEmailId: "test@example.com",
        customerMobileNo: "9999999999"
      },
      signature: "test_signature_success"
    },
    response: {
      status: 200,
      statusText: "OK",
      text: "<!DOCTYPE html><html><head><title>Payment Gateway</title></head><body><form action=\"https://checkout.freecharge.in/payment/v1/checkout\" method=\"POST\"><input type=\"hidden\" name=\"merchantId\" value=\"MERec40511352\">...</form></body></html>"
    }
  }
};

// Test runner
class PaymentLoggingTester {
  constructor() {
    this.logger = new MockPaymentLogger();
  }

  async runTest(scenarioName) {
    const scenario = testScenarios[scenarioName];
    if (!scenario) {
      log(`❌ Unknown scenario: ${scenarioName}`, 'red');
      return;
    }

    logSection(`Testing: ${scenario.name}`);
    log(scenario.description, 'yellow');

    const requestId = scenario.request.merchantTxnId;

    try {
      // Log the request
      this.logger.logRequest(scenario.request, requestId);

      // Simulate different scenarios
      if (scenarioName === 'sessionExpired') {
        // Simulate session expired response
        this.logger.logResponse(scenario.response, scenario.response.text, requestId);
        this.logger.logSessionExpired(scenario.request, scenario.response.text, requestId);
      } else if (scenarioName === 'networkError') {
        // Simulate network error
        this.logger.logError(scenario.error, requestId, 'API call');
      } else if (scenarioName === 'validationError') {
        // Simulate validation error
        this.logger.logError(scenario.error, requestId, 'Amount validation');
      } else if (scenarioName === 'successFlow') {
        // Simulate success flow
        this.logger.logResponse(scenario.response, scenario.response.text, requestId);
        this.logger.log({
          type: 'SUCCESS',
          level: 'INFO',
          message: 'Payment completed successfully',
          requestId,
          data: {
            transactionId: requestId,
            amount: scenario.request.merchantTxnAmount,
            status: 'SUCCESS'
          }
        });
      }

      log(`✅ ${scenario.name} test completed successfully`, 'green');

    } catch (error) {
      log(`❌ ${scenario.name} test failed: ${error.message}`, 'red');
    }
  }

  async runAllTests() {
    logSection("RUNNING ALL PAYMENT LOGGING TESTS");
    
    for (const scenarioName of Object.keys(testScenarios)) {
      await this.runTest(scenarioName);
      // Add a small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Display test results
    this.displayTestResults();
  }

  displayTestResults() {
    logSection("TEST RESULTS SUMMARY");
    
    const totalLogs = this.logger.logs.length;
    const errorLogs = this.logger.getErrorLogs();
    const requestLogs = this.logger.getLogs({ type: 'REQUEST' });
    const responseLogs = this.logger.getLogs({ type: 'RESPONSE' });
    const successLogs = this.logger.getLogs({ type: 'SUCCESS' });

    log(`Total Logs Generated: ${totalLogs}`, 'cyan');
    log(`Request Logs: ${requestLogs.length}`, 'green');
    log(`Response Logs: ${responseLogs.length}`, 'blue');
    log(`Error Logs: ${errorLogs.length}`, 'red');
    log(`Success Logs: ${successLogs.length}`, 'green');

    // Export logs to file
    const exportedLogs = this.logger.exportLogs();
    const filename = `payment-logs-test-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(__dirname, '..', 'logs', filename);
    
    // Ensure logs directory exists
    const logsDir = path.dirname(filepath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    fs.writeFileSync(filepath, JSON.stringify(exportedLogs, null, 2));
    log(`\n📁 Logs exported to: ${filepath}`, 'cyan');

    // Display error analysis
    if (errorLogs.length > 0) {
      logSubSection("ERROR ANALYSIS");
      const errorTypes = {};
      errorLogs.forEach(log => {
        const errorType = log.data?.error?.name || 'Unknown';
        errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
      });

      Object.entries(errorTypes).forEach(([type, count]) => {
        log(`${type}: ${count}`, 'red');
      });
    }
  }

  clearLogs() {
    this.logger.clearLogs();
    log("🧹 All logs cleared", 'yellow');
  }
}

// Main execution
async function main() {
  const tester = new PaymentLoggingTester();
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Run all tests
    await tester.runAllTests();
  } else if (args[0] === 'clear') {
    // Clear logs
    tester.clearLogs();
  } else if (args[0] === 'demo') {
    // Run demonstration
    const { demonstratePaymentGatewayLogging } = require('./payment-gateway-demo');
    demonstratePaymentGatewayLogging();
  } else {
    // Run specific test
    await tester.runTest(args[0]);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { PaymentLoggingTester, testScenarios };
