# Payment Gateway Error Logging System

## Overview

This document provides comprehensive information about the payment gateway error logging system, including request/response logs, error analysis, and debugging tools.

## 🔍 **Request and Response Logs**

### **1. Request Logs**

#### **Basic Request Information**
```typescript
{
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
}
```

#### **API Call Request**
```typescript
{
  timestamp: "2024-01-15T10:30:01.000Z",
  type: "REQUEST",
  level: "INFO",
  message: "Making API call to payment gateway",
  requestId: "TXN_1705312200000_ABC123",
  data: {
    url: "https://checkout.freecharge.in/payment/v1/checkout",
    method: "POST",
    formDataSize: 1024,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  }
}
```

### **2. Response Logs**

#### **Successful Response**
```typescript
{
  timestamp: "2024-01-15T10:30:05.000Z",
  type: "RESPONSE",
  level: "INFO",
  message: "Payment gateway response received",
  requestId: "TXN_1705312200000_ABC123",
  data: {
    status: 200,
    statusText: "OK",
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-length": "5000"
    },
    responseLength: 5000,
    responsePreview: "<!DOCTYPE html><html><head><title>Payment Gateway</title></head><body><form action=\"https://checkout.freecharge.in/payment/v1/checkout\" method=\"POST\">...</form></body></html>",
    isSuccess: true,
    contentType: "text/html; charset=utf-8",
    hasSessionExpired: false,
    hasError: false,
    hasForm: true,
    hasPayment: true
  }
}
```

#### **Session Expired Response**
```typescript
{
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
}
```

### **3. Error Logs**

#### **Session Expired Error**
```typescript
{
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
```

#### **Network Error**
```typescript
{
  timestamp: "2024-01-15T10:30:10.000Z",
  type: "ERROR",
  level: "ERROR",
  message: "Payment gateway error in API call",
  requestId: "TXN_1705312200000_ABC123",
  data: {
    error: {
      name: "TypeError",
      message: "Failed to fetch",
      stack: "TypeError: Failed to fetch\n    at PaymentService.initiateCheckout"
    },
    context: "API call"
  }
}
```

#### **Validation Error**
```typescript
{
  timestamp: "2024-01-15T10:30:00.000Z",
  type: "ERROR",
  level: "ERROR",
  message: "Payment gateway error in Amount validation",
  requestId: "TXN_1705312200000_ABC123",
  data: {
    error: {
      name: "Error",
      message: "Amount must be at least ₹1",
      stack: "Error: Amount must be at least ₹1\n    at validateAmount"
    },
    context: "Amount validation"
  }
}
```

## 🛠️ **Error Analysis Tools**

### **1. Real-time Error Monitoring**

The system provides real-time error monitoring with:
- **Error Count**: Total number of errors
- **Error Types**: Categorized by error type
- **Common Patterns**: Identified recurring issues
- **Recommendations**: Suggested solutions

### **2. Error Pattern Detection**

#### **Session Expired Pattern**
- **Detection**: Response contains "Session Expired" or "SPG-0006"
- **Common Causes**:
  - Timestamp in future
  - Timestamp too old
  - Invalid signature
  - Invalid merchant credentials
  - Callback URL not accessible

#### **Network Error Pattern**
- **Detection**: TypeError with "Failed to fetch"
- **Common Causes**:
  - Network connectivity issues
  - Payment gateway unavailability
  - Incorrect URLs or endpoints

#### **Validation Error Pattern**
- **Detection**: Context includes "validation"
- **Common Causes**:
  - Invalid amount
  - Invalid customer information
  - Missing required fields

### **3. Debugging Information**

#### **Signature Generation Debug**
```typescript
{
  timestamp: "2024-01-15T10:30:00.000Z",
  type: "DEBUG",
  level: "DEBUG",
  message: "Signature generation process",
  requestId: "TXN_1705312200000_ABC123",
  data: {
    inputData: {
      merchantId: "MERec40511352",
      callbackUrl: "https://your-domain.com/api/payment/callback",
      merchantTxnId: "TXN_1705312200000_ABC123",
      merchantTxnAmount: 100,
      currency: "INR",
      timestamp: 1705312200000
    },
    generatedSignature: "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
    signatureLength: 48,
    isHex: true
  }
}
```

## 📊 **Log Viewer Features**

### **1. Filtering Options**
- **Type**: Request, Response, Error, Success
- **Level**: Error, Warning, Info, Debug
- **Request ID**: Filter by specific request
- **Time Range**: Filter by timestamp

### **2. Log Details**
- **Basic Information**: Timestamp, type, level, message
- **Request Data**: Complete request payload
- **Response Data**: Response headers and content
- **Error Details**: Stack trace and context

### **3. Export Functionality**
- **JSON Export**: Complete log data
- **Filtered Export**: Only selected logs
- **Date Range Export**: Specific time period

## 🔧 **Common Error Solutions**

### **1. Session Expired Solutions**

#### **Timestamp Issues**
```typescript
// Check if timestamp is in future
const now = new Date();
const requestTime = new Date(request.timestamp);
if (requestTime > now) {
  console.error('CRITICAL: Timestamp is in the future!');
  throw new Error('Timestamp cannot be in the future');
}

// Check if timestamp is too old (more than 5 minutes)
const timeDiff = now.getTime() - request.timestamp;
if (timeDiff > 5 * 60 * 1000) {
  console.warn('WARNING: Timestamp is older than 5 minutes');
}
```

#### **Signature Issues**
```typescript
// Verify signature generation
const expectedSignature = generateSignature(requestData, merchantKey);
if (request.signature !== expectedSignature) {
  console.error('Signature mismatch detected');
  console.log('Expected:', expectedSignature);
  console.log('Received:', request.signature);
}
```

### **2. Network Error Solutions**

#### **URL Verification**
```typescript
// Verify payment gateway URL
const baseUrl = process.env.PAYMENT_GATEWAY_URL;
if (!baseUrl) {
  throw new Error('Payment gateway URL not configured');
}

// Test connectivity
try {
  const response = await fetch(`${baseUrl}/health`);
  if (!response.ok) {
    throw new Error(`Payment gateway health check failed: ${response.status}`);
  }
} catch (error) {
  console.error('Payment gateway connectivity issue:', error);
}
```

### **3. Validation Error Solutions**

#### **Amount Validation**
```typescript
// Validate amount
const validateAmount = (amount: number) => {
  if (amount < 1) {
    return { valid: false, error: 'Amount must be at least ₹1' };
  }
  if (amount > 100000) {
    return { valid: false, error: 'Amount cannot exceed ₹1,00,000' };
  }
  return { valid: true };
};
```

#### **Customer Information Validation**
```typescript
// Validate customer information
const validateCustomerInfo = (customerInfo: any) => {
  if (!customerInfo.customerName || customerInfo.customerName.trim().length === 0) {
    return { valid: false, error: 'Customer name is required' };
  }
  if (!customerInfo.customerEmailId || !isValidEmail(customerInfo.customerEmailId)) {
    return { valid: false, error: 'Valid email is required' };
  }
  if (!customerInfo.customerMobileNo || !isValidMobile(customerInfo.customerMobileNo)) {
    return { valid: false, error: 'Valid mobile number is required' };
  }
  return { valid: true };
};
```

## 📱 **Admin Interface**

### **1. Payment Logs Page**
- **URL**: `/admin/payment-logs`
- **Features**:
  - Real-time log viewing
  - Error analysis
  - Log filtering and search
  - Export functionality

### **2. Error Analysis Dashboard**
- **Error Summary**: Total errors and types
- **Common Patterns**: Recurring issues
- **Recommendations**: Suggested solutions
- **Recent Errors**: Latest error logs

### **3. Test Log Generation**
- **Generate Test Logs**: Create sample error scenarios
- **Load Examples**: Pre-defined error examples
- **Simulate Scenarios**: Test different error conditions

## 🚀 **Usage Examples**

### **1. Basic Logging**
```typescript
import PaymentLogger from '@/utils/paymentLogger';

// Log a request
PaymentLogger.logRequest(request, requestId);

// Log a response
PaymentLogger.logResponse(response, responseText, requestId);

// Log an error
PaymentLogger.logError(error, requestId, 'API call');
```

### **2. Error Analysis**
```typescript
// Get all error logs
const errorLogs = PaymentLogger.getErrorLogs();

// Get logs for specific request
const requestLogs = PaymentLogger.getRequestLogs(requestId);

// Export all logs
const exportedLogs = PaymentLogger.exportLogs();
```

### **3. Real-time Monitoring**
```typescript
// Set up interval to check for new errors
setInterval(() => {
  const recentErrors = PaymentLogger.getLogs({ level: 'ERROR' });
  if (recentErrors.length > 0) {
    console.log('New errors detected:', recentErrors);
    // Send alerts or notifications
  }
}, 5000);
```

## 📋 **Best Practices**

### **1. Logging Guidelines**
- **Always log requests and responses**
- **Include request IDs for traceability**
- **Log errors with full context**
- **Use appropriate log levels**

### **2. Error Handling**
- **Catch and log all errors**
- **Provide meaningful error messages**
- **Include stack traces for debugging**
- **Categorize errors by type**

### **3. Performance Considerations**
- **Limit log storage size**
- **Use appropriate log levels**
- **Implement log rotation**
- **Monitor log performance impact**

## 🔍 **Troubleshooting Guide**

### **1. Session Expired Issues**
1. Check system clock synchronization
2. Verify timestamp generation
3. Validate signature generation
4. Check merchant credentials
5. Verify callback URL accessibility

### **2. Network Issues**
1. Check network connectivity
2. Verify payment gateway URLs
3. Check firewall settings
4. Test with different endpoints

### **3. Validation Issues**
1. Review input validation rules
2. Check data sanitization
3. Verify required fields
4. Test with different data types

This comprehensive error logging system provides complete visibility into payment gateway operations, enabling quick identification and resolution of issues.
