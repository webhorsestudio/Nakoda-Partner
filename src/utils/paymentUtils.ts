// Payment Gateway Utilities
import crypto from 'crypto';
import { CheckoutRequest, TransactionStatusRequest, RefundRequest, VerifiedAccountInfo, SubMerchantPayInfo } from '@/types/payment';
import { getPaymentConfig, errorCodes } from '@/config/payment';

// JWT encryption utilities for production APIs
interface JWTHeader {
  alg: string;
  typ: string;
}

// Union type for all possible JWT payloads
type JWTPayload = TransactionStatusRequest | RefundRequest | CheckoutRequest;

/**
 * Create JWT token for encrypted API requests
 * @param payload - Data to encrypt
 * @param privateKey - Private key for signing
 * @returns JWT token string
 */
export const createJWT = (payload: JWTPayload, privateKey: string): string => {
  try {
    // For now, we'll use a simple base64 encoding approach
    // In production, you should use a proper JWT library like 'jsonwebtoken'
    const header: JWTHeader = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    // Create signature
    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  } catch (error) {
    console.error('Error creating JWT:', error);
    throw new Error('Failed to create JWT token');
  }
};

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @param publicKey - Public key for verification
 * @returns Decoded payload if valid
 */
export const verifyJWT = (token: string, publicKey: string): JWTPayload | null => {
  try {
    const [header, payload, signature] = token.split('.');
    
    if (!header || !payload || !signature) {
      return null;
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', publicKey)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return null;
  }
};

/**
 * Generate signature for Axis PG requests
 * @param data - Object containing all non-null field values
 * @param merchantKey - Merchant key for signature generation
 * @param isCallback - Whether this is for callback signature verification
 * @returns SHA-256 hex encoded signature
 */
export const generateSignature = (data: CheckoutRequest | TransactionStatusRequest | RefundRequest | Record<string, string | number | boolean | null | undefined>, merchantKey: string, isCallback: boolean = false): string => {
  // Fields required for signature generation (in ascending order)
  const signatureFields = isCallback ? [
    // Callback signature fields (different order for callback verification)
    'merchantTxnId',
    'txnReferenceId',
    'amount',
    'currency',
    'handlingFee',
    'taxAmount',
    'mode',
    'subMode',
    'issuerCode',
    'issuerName',
    'mndtRefId',
    'mndtUmn',
    'errorCode',
    'errorDescription',
    'paymentDueDate',
    'transactionStartDate',
    'transactionEndDate',
    'rrn',
    'subMerchantPayInfo',
    'merchantOrderId',
    'authCode',
    'payerVpa',
    'accountType',
    'maskedCardNo'
  ] : [
    // Regular request signature fields
    'merchantId',
    'clientId',
    'merchantTxnId',
    'merchantTxnAmount',
    'currency',
    'timestamp',
    'callbackUrl',
    'customerId',
    'customerName',
    'customerEmailId',
    'customerMobileNo',
    'customerStreetAddress',
    'customerCity',
    'customerState',
    'customerPIN',
    'customerCountry',
    'tags',
    'udf1',
    'udf2',
    'udf3',
    'udf4',
    'udf5',
    'reconId',
    'merchantOrderId',
    'utilityBiller',
    'subMerchantPayInfo',
    'verifiedAccountInfo',
    'verifiedPayment',
    'paymentMode',
    'txnType',
    'returnUrl'
  ];

  // Convert data to a record for safe access
  const dataRecord = data as Record<string, string | number | boolean | null | undefined>;

  // Filter and sort fields according to signature requirements
  const filteredData = signatureFields
    .filter(field => dataRecord[field] !== null && dataRecord[field] !== undefined && dataRecord[field] !== '')
    .map(field => ({ field, value: String(dataRecord[field]) }))
    .sort((a, b) => a.field.localeCompare(b.field));

  // Concatenate values in ascending order of field names
  const concatenatedString = filteredData.map(({ value }) => value).join('');

  // Append merchant key
  const stringToHash = concatenatedString + merchantKey;

  console.log('Signature generation debug:', {
    isCallback,
    fields: filteredData.map(({ field, value }) => ({ field, value: value.substring(0, 20) + '...' })),
    concatenatedLength: concatenatedString.length,
    merchantKeyLength: merchantKey.length,
    concatenatedString: concatenatedString.substring(0, 100) + '...',
    stringToHash: stringToHash.substring(0, 100) + '...'
  });

  // Create SHA-256 hash and hex encode
  const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
  
  return hash;
};

/**
 * Generate unique merchant transaction ID
 * @param prefix - Optional prefix for the transaction ID
 * @returns Unique transaction ID
 */
export const generateMerchantTxnId = (prefix: string = 'TXN'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Generate unique refund transaction ID
 * @param prefix - Optional prefix for the refund ID
 * @returns Unique refund transaction ID
 */
export const generateRefundTxnId = (prefix: string = 'REF'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Encode verified account info for verified payments
 * @param accountInfo - Bank account information
 * @returns URL encoded JSON string
 */
export const encodeVerifiedAccountInfo = (accountInfo: VerifiedAccountInfo[]): string => {
  const jsonString = JSON.stringify(accountInfo);
  return encodeURIComponent(jsonString);
};

/**
 * Decode verified account info from callback
 * @param encodedInfo - URL encoded account info
 * @returns Decoded account info array
 */
export const decodeVerifiedAccountInfo = (encodedInfo: string): VerifiedAccountInfo[] => {
  try {
    const decodedString = decodeURIComponent(encodedInfo);
    return JSON.parse(decodedString);
  } catch (error) {
    console.error('Error decoding verified account info:', error);
    return [];
  }
};

/**
 * Encode sub merchant pay info
 * @param subMerchantInfo - Sub merchant payment information
 * @returns URL encoded JSON string
 */
export const encodeSubMerchantPayInfo = (subMerchantInfo: SubMerchantPayInfo[]): string => {
  const jsonString = JSON.stringify(subMerchantInfo);
  return encodeURIComponent(jsonString);
};

/**
 * Decode sub merchant pay info from callback
 * @param encodedInfo - URL encoded sub merchant info
 * @returns Decoded sub merchant info array
 */
export const decodeSubMerchantPayInfo = (encodedInfo: string): SubMerchantPayInfo[] => {
  try {
    const decodedString = decodeURIComponent(encodedInfo);
    return JSON.parse(decodedString);
  } catch (error) {
    console.error('Error decoding sub merchant pay info:', error);
    return [];
  }
};

/**
 * Validate amount
 * @param amount - Amount to validate
 * @returns Validation result
 */
export const validateAmount = (amount: number): { valid: boolean; error?: string } => {
  if (amount < 1) {
    return { valid: false, error: 'Amount must be at least ₹1' };
  }
  if (amount > 1000000) {
    return { valid: false, error: 'Amount cannot exceed ₹10,00,000' };
  }
  if (!Number.isFinite(amount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  return { valid: true };
};

/**
 * Validate merchant transaction ID format
 * @param txnId - Transaction ID to validate
 * @returns Validation result
 */
export const validateMerchantTxnId = (txnId: string): { valid: boolean; error?: string } => {
  const regex = /^[a-zA-Z0-9_-]+$/;
  if (!regex.test(txnId)) {
    return { valid: false, error: 'Transaction ID must contain only alphanumeric characters, hyphens, and underscores' };
  }
  if (txnId.length > 30) {
    return { valid: false, error: 'Transaction ID cannot exceed 30 characters' };
  }
  return { valid: true };
};

/**
 * Validate customer information
 * @param customerInfo - Customer information object
 * @returns Validation result
 */
export const validateCustomerInfo = (customerInfo: {
  customerId?: string;
  customerName?: string;
  customerEmailId?: string;
  customerMobileNo?: string;
  customerStreetAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerPIN?: string;
  customerCountry?: string;
}): { valid: boolean; error?: string } => {
  const regex = /^[a-zA-Z0-9@.,\s-/]*$/;
  
  if (customerInfo.customerId && !regex.test(customerInfo.customerId)) {
    return { valid: false, error: 'Customer ID contains invalid characters' };
  }
  if (customerInfo.customerName && !regex.test(customerInfo.customerName)) {
    return { valid: false, error: 'Customer Name contains invalid characters' };
  }
  if (customerInfo.customerEmailId && !isValidEmail(customerInfo.customerEmailId)) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (customerInfo.customerMobileNo && !isValidMobile(customerInfo.customerMobileNo)) {
    return { valid: false, error: 'Invalid mobile number format' };
  }
  if (customerInfo.customerStreetAddress && !regex.test(customerInfo.customerStreetAddress)) {
    return { valid: false, error: 'Street Address contains invalid characters' };
  }
  if (customerInfo.customerCity && !regex.test(customerInfo.customerCity)) {
    return { valid: false, error: 'City contains invalid characters' };
  }
  if (customerInfo.customerState && !regex.test(customerInfo.customerState)) {
    return { valid: false, error: 'State contains invalid characters' };
  }
  if (customerInfo.customerPIN && !regex.test(customerInfo.customerPIN)) {
    return { valid: false, error: 'PIN contains invalid characters' };
  }
  if (customerInfo.customerCountry && !regex.test(customerInfo.customerCountry)) {
    return { valid: false, error: 'Country contains invalid characters' };
  }
  
  return { valid: true };
};

/**
 * Validate email format
 * @param email - Email to validate
 * @returns Validation result
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate mobile number format
 * @param mobile - Mobile number to validate
 * @returns Validation result
 */
export const isValidMobile = (mobile: string): boolean => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

/**
 * Get error message from status code
 * @param statusCode - Status code from response
 * @returns Error message and category
 */
export const getErrorMessage = (statusCode: string): { message: string; category: string } => {
  return errorCodes[statusCode] || { message: 'Unknown error', category: 'TECHNICAL' };
};

/**
 * Check if status code indicates success
 * @param statusCode - Status code to check
 * @returns True if successful
 */
export const isSuccessStatus = (statusCode: string): boolean => {
  return statusCode === 'SPG-0000' || statusCode === '00' || statusCode === 'SUCCESS';
};

/**
 * Check if status code indicates pending
 * @param statusCode - Status code to check
 * @returns True if pending
 */
export const isPendingStatus = (statusCode: string): boolean => {
  return statusCode === 'SPG-0002' || statusCode === 'SPG-5001' || statusCode === 'SPG-8000' || 
         statusCode === '02' || statusCode === 'PENDING';
};

/**
 * Check if status code indicates failure
 * @param statusCode - Status code to check
 * @returns True if failed
 */
export const isFailureStatus = (statusCode: string): boolean => {
  return !isSuccessStatus(statusCode) && !isPendingStatus(statusCode);
};

/**
 * Format amount for display
 * @param amount - Amount to format
 * @param currency - Currency code
 * @returns Formatted amount string
 */
export const formatAmount = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Generate callback URL
 * @param baseUrl - Base URL of the application
 * @param path - Callback path
 * @returns Complete callback URL
 */
export const generateCallbackUrl = (baseUrl: string, path: string = '/api/payment/callback'): string => {
  return `${baseUrl}${path}`;
};

/**
 * Create checkout request object
 * @param params - Checkout parameters
 * @returns Checkout request object
 */
export const createCheckoutRequest = (params: {
  amount: number;
  customerInfo?: {
    customerId?: string;
    customerName?: string;
    customerEmailId?: string;
    customerMobileNo?: string;
    customerStreetAddress?: string;
    customerCity?: string;
    customerState?: string;
    customerPIN?: string;
    customerCountry?: string;
  };
  verifiedAccountInfo?: VerifiedAccountInfo[];
  subMerchantPayInfo?: SubMerchantPayInfo[];
  tags?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  reconId?: string;
  merchantOrderId?: string;
  utilityBiller?: string;
}): CheckoutRequest => {
  const config = getPaymentConfig();
  console.log('createCheckoutRequest config:', {
    baseUrl: config.baseUrl,
    merchantId: config.merchantId,
    merchantKey: config.merchantKey ? 'SET' : 'NOT SET',
    merchantKeyLength: config.merchantKey?.length || 0,
    isSandbox: config.baseUrl.includes('sandbox'),
    environment: process.env.NODE_ENV,
    merchantKeyPreview: config.merchantKey ? config.merchantKey.substring(0, 8) + '...' : 'NOT SET'
  });
  
  const merchantTxnId = generateMerchantTxnId();
  const timestamp = Math.floor(Date.now() / 1000);
  const callbackUrl = generateCallbackUrl(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/partner/wallet?payment=success`;

  // Log timestamp for debugging
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDiff = currentTime - timestamp;
  console.log('Payment request timestamp:', {
    timestamp,
    date: new Date(timestamp * 1000).toISOString(),
    currentTime: new Date().toISOString(),
    currentTimestamp: currentTime,
    timeDiff,
    isValidTime: timeDiff >= 0 && timeDiff <= 300, // Within 5 minutes
    isTooOld: timeDiff > 300,
    isInFuture: timeDiff < 0
  });

  const requestData: CheckoutRequest = {
    merchantId: config.merchantId,
    clientId: config.clientId,
    callbackUrl,
    merchantTxnId,
    merchantTxnAmount: params.amount,
    currency: 'INR',
    timestamp,
    signature: '', // Will be generated after creating the object
    // Customer information
    customerId: params.customerInfo?.customerId || '',
    customerName: params.customerInfo?.customerName || '',
    customerEmailId: params.customerInfo?.customerEmailId || '',
    customerMobileNo: params.customerInfo?.customerMobileNo || '',
    customerStreetAddress: params.customerInfo?.customerStreetAddress || '',
    customerCity: params.customerInfo?.customerCity || '',
    customerState: params.customerInfo?.customerState || '',
    customerPIN: params.customerInfo?.customerPIN || '',
    customerCountry: params.customerInfo?.customerCountry || 'India',
    // Additional fields
    tags: params.tags || '',
    udf1: params.udf1 || '',
    udf2: params.udf2 || '',
    udf3: params.udf3 || '',
    udf4: params.udf4 || '',
    udf5: params.udf5 || '',
    reconId: params.reconId || '',
    merchantOrderId: params.merchantOrderId || '',
    utilityBiller: params.utilityBiller || '',
    // Additional required parameters for Axis PG
    paymentMode: 'ALL', // Allow all payment modes
    txnType: 'SALE', // Transaction type
    returnUrl: returnUrl, // Return URL after payment (different from callback)
  };

  // Add verified payment info if provided
  if (params.verifiedAccountInfo && params.verifiedAccountInfo.length > 0) {
    requestData.verifiedAccountInfo = encodeVerifiedAccountInfo(params.verifiedAccountInfo);
    requestData.verifiedPayment = true;
  }

  // Add sub merchant pay info if provided
  if (params.subMerchantPayInfo && params.subMerchantPayInfo.length > 0) {
    requestData.subMerchantPayInfo = encodeSubMerchantPayInfo(params.subMerchantPayInfo);
  }

  // Generate signature
  console.log('Generating signature for request:', {
    merchantId: requestData.merchantId,
    merchantTxnId: requestData.merchantTxnId,
    amount: requestData.merchantTxnAmount,
    merchantKey: config.merchantKey ? 'SET' : 'NOT SET'
  });
  
  requestData.signature = generateSignature(requestData, config.merchantKey);
  console.log('Generated signature:', requestData.signature);

  return requestData;
};

/**
 * Create transaction status request object
 * @param merchantTxnId - Merchant transaction ID
 * @param txnReferenceId - Optional transaction reference ID
 * @returns Transaction status request object
 */
export const createTransactionStatusRequest = (
  merchantTxnId: string,
  txnReferenceId?: string
): TransactionStatusRequest => {
  const config = getPaymentConfig();
  
  const requestData: TransactionStatusRequest = {
    merchantId: config.merchantId,
    merchantTxnId,
    txnReferenceId,
    signature: '', // Will be generated after creating the object
  };

  // Generate signature
  requestData.signature = generateSignature(requestData, config.merchantKey);

  return requestData;
};

/**
 * Create refund request object
 * @param params - Refund parameters
 * @returns Refund request object
 */
export const createRefundRequest = (params: {
  txnReferenceId: string;
  refundAmount: number;
  refundType?: 'ONLINE' | 'OFFLINE';
}): RefundRequest => {
  const config = getPaymentConfig();
  const merchantRefundTxnId = generateRefundTxnId();
  
  const requestData: RefundRequest = {
    merchantId: config.merchantId,
    merchantRefundTxnId,
    txnReferenceId: params.txnReferenceId,
    refundType: params.refundType || 'OFFLINE',
    refundAmount: params.refundAmount,
    currency: 'INR',
    signature: '', // Will be generated after creating the object
  };

  // Generate signature
  requestData.signature = generateSignature(requestData, config.merchantKey);

  return requestData;
};
