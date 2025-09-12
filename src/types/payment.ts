// Payment Gateway Types for Axis PG Integration

export interface PaymentConfig {
  sandbox: {
    baseUrl: string;
    merchantId: string;
    clientId: string;
    merchantKey: string;
    publicKey?: string; // Optional for JWT encryption
    privateKey?: string; // Optional for JWT encryption
  };
  production: {
    baseUrl: string;
    merchantId: string;
    clientId: string;
    merchantKey: string;
    publicKey?: string; // Optional for JWT encryption
    privateKey?: string; // Optional for JWT encryption
  };
}

export interface CheckoutRequest {
  merchantId: string;
  clientId: string;
  callbackUrl: string;
  merchantTxnId: string;
  merchantTxnAmount: number;
  currency: string;
  verifiedAccountInfo?: string;
  verifiedPayment?: boolean;
  tags?: string;
  customerId?: string;
  customerName?: string;
  customerEmailId?: string;
  customerMobileNo?: string;
  customerStreetAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerPIN?: string;
  customerCountry?: string;
  timestamp: number;
  signature: string;
  subMerchantPayInfo?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  reconId?: string;
  merchantOrderId?: string;
  utilityBiller?: string;
  // Additional required parameters for Axis PG
  paymentMode?: string;
  txnType?: string;
  returnUrl?: string;
}

export interface VerifiedAccountInfo {
  accountNumber: string;
  ifsc: string;
}

export interface SubMerchantPayInfo {
  subEntityId: string;
  subEntityTxnAmount: number;
  subEntityType?: number;
  subEntityProduct: string;
}

export interface TransactionStatusRequest {
  merchantId: string;
  merchantTxnId: string;
  txnReferenceId?: string;
  signature: string;
}

export interface TransactionStatusResponse {
  statusCode: string;
  statusMessage: string;
  data?: {
    merchantTxnId: string;
    txnReferenceId: string;
    amount: number;
    currency: string;
    transactionFee?: {
      handlingFee: number;
      taxAmount: number;
    };
    subMercPayInfo?: string;
    tags?: string;
    merchantId: string;
    createdDate: string;
    txnType: string;
    txnMode: string;
    txnSubMode: string;
    refundType?: string;
    mndtRefId?: string;
    mndtUmn?: string;
    merchantOrderId?: string;
    payerVpa?: string;
    maskedCardNo?: string;
    accountType?: string;
    errorCode?: string;
    errorDescription?: string;
    authCode?: string;
  };
}

export interface RefundRequest {
  merchantId: string;
  merchantRefundTxnId: string;
  txnReferenceId: string;
  refundType?: 'ONLINE' | 'OFFLINE';
  refundAmount: number;
  currency: string;
  signature: string;
}

export interface RefundResponse {
  statusCode: string;
  statusMessage: string;
  data?: {
    merchantTxnId: string;
    txnReferenceId: string;
    refundAmount: number;
    refundType?: string;
  };
}

export interface CallbackData {
  statusCode: string;
  statusMessage: string;
  merchantTxnId: string;
  txnReferenceId: string;
  amount: number;
  currency: string;
  handlingFee: number;
  taxAmount: number;
  mode: string;
  subMode: string;
  issuerCode?: string;
  issuerName?: string;
  signature: string;
  mndtRefId?: string;
  mndtUmn?: string;
  errorCode?: string;
  errorDescription?: string;
  paymentDueDate?: string;
  transactionStartDate?: string;
  transactionEndDate?: string;
  rrn?: string;
  subMerchantPayInfo?: string;
  merchantOrderId?: string;
  authCode?: string;
  payerVpa?: string;
  accountType?: string;
  maskedCardNo?: string;
}

export interface PaymentMode {
  code: string;
  name: string;
  subModes?: {
    code: string;
    name: string;
  }[];
}

export interface BankInfo {
  id: string;
  name: string;
  code: string;
}

export interface WalletInfo {
  code: string;
  name: string;
}

export interface PaymentError {
  code: string;
  message: string;
  description: string;
  category: 'VALIDATION' | 'AUTHENTICATION' | 'AUTHORIZATION' | 'BUSINESS' | 'TECHNICAL';
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  referenceId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  error?: PaymentError;
  redirectUrl?: string;
  html?: string;
  message?: string;
}

export interface PaymentSession {
  id: string;
  merchantTxnId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
  callbackUrl: string;
  txnReferenceId?: string;
  errorCode?: string;
  errorMessage?: string;
}
