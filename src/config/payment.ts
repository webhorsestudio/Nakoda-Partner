// Payment Gateway Configuration
import { PaymentConfig, PaymentMode, BankInfo, WalletInfo } from '@/types/payment';

// Environment-based configuration
export const paymentConfig: PaymentConfig = {
  sandbox: {
    baseUrl: process.env.AXIS_PG_SANDBOX_URL || 'https://sandbox-axispg.freecharge.in',
    merchantId: process.env.AXIS_PG_SANDBOX_MERCHANT_ID || 'y42rWymNiOKlXF', // Use production credentials for testing
    clientId: process.env.AXIS_PG_SANDBOX_MERCHANT_ID || 'y42rWymNiOKlXF', // clientId is same as merchantId
    merchantKey: process.env.AXIS_PG_SANDBOX_MERCHANT_KEY || '119706bf-9068-4392-813a-b789d7bdc7b8',
    publicKey: '', // Not required for basic integration
    privateKey: '', // Not required for basic integration
  },
  production: {
    baseUrl: process.env.AXIS_PG_PRODUCTION_URL || 'https://checkout.freecharge.in',
    merchantId: process.env.AXIS_PG_PRODUCTION_MERCHANT_ID || 'MERec40511352',
    clientId: process.env.AXIS_PG_PRODUCTION_CLIENT_ID || 'MERec40511352',
    merchantKey: process.env.AXIS_PG_PRODUCTION_MERCHANT_KEY || 'W3gJPVkKNg3GO8aFC6aOz33/+0MYOBMxLbrqWmiYQ/s=',
    publicKey: process.env.AXIS_PG_PRODUCTION_PUBLIC_KEY || '', // Required for JWT+JWE encryption
    privateKey: process.env.AXIS_PG_PRODUCTION_PRIVATE_KEY || '', // Required for JWT+JWE encryption
  },
};

// Get current environment configuration
export const getPaymentConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? paymentConfig.production : paymentConfig.sandbox;
};

// Payment modes supported by Axis PG
export const paymentModes: PaymentMode[] = [
  {
    code: 'CC',
    name: 'Credit Card',
    subModes: [
      { code: 'VI', name: 'Visa' },
      { code: 'MC', name: 'Mastercard' },
      { code: 'RPAY', name: 'RuPay' },
      { code: 'AMEX', name: 'American Express' },
      { code: 'DINR', name: 'Diners' },
    ],
  },
  {
    code: 'DC',
    name: 'Debit Card',
    subModes: [
      { code: 'VI', name: 'Visa' },
      { code: 'MC', name: 'Mastercard' },
      { code: 'RPAY', name: 'RuPay' },
    ],
  },
  {
    code: 'UPI',
    name: 'UPI',
    subModes: [
      { code: 'COLLECT', name: 'UPI Collect' },
      { code: 'INTENT', name: 'UPI Intent' },
      { code: 'QR', name: 'UPI QR' },
      { code: 'STATIC_QR', name: 'UPI Static QR' },
      { code: 'SDK', name: 'UPI SDK' },
    ],
  },
  {
    code: 'NB',
    name: 'Net Banking',
    subModes: [],
  },
  {
    code: 'WALLET',
    name: 'Wallet',
    subModes: [],
  },
];

// Bank information for Net Banking
export const banks: BankInfo[] = [
  { id: '0001', name: 'Aditya Birla Payments Bank', code: '0001' },
  { id: '0002', name: 'Airtel Payments Bank', code: '0002' },
  { id: '0003', name: 'Allahabad Bank', code: '0003' },
  { id: '0004', name: 'Andhra Bank', code: '0004' },
  { id: '0005', name: 'AXIS Bank', code: '0005' },
  { id: '0006', name: 'Bank of Baroda', code: '0006' },
  { id: '0007', name: 'Bank of India', code: '0007' },
  { id: '0008', name: 'Bank of Maharashtra', code: '0008' },
  { id: '0009', name: 'Canara Bank', code: '0009' },
  { id: '0010', name: 'Catholic Syrian Bank', code: '0010' },
  { id: '0011', name: 'Central Bank of India', code: '0011' },
  { id: '0012', name: 'Citibank', code: '0012' },
  { id: '0013', name: 'City Union Bank', code: '0013' },
  { id: '0014', name: 'Corporation Bank', code: '0014' },
  { id: '0015', name: 'Cosmos Bank', code: '0015' },
  { id: '0016', name: 'DCB Bank', code: '0016' },
  { id: '0017', name: 'Dena Bank', code: '0017' },
  { id: '0018', name: 'Deutsche Bank', code: '0018' },
  { id: '0019', name: 'Federal Bank', code: '0019' },
  { id: '0020', name: 'HDFC Bank', code: '0020' },
  { id: '0021', name: 'ICICI Bank', code: '0021' },
  { id: '0022', name: 'IDBI Bank', code: '0022' },
  { id: '0023', name: 'IDFC Bank', code: '0023' },
  { id: '0024', name: 'Indian Bank', code: '0024' },
  { id: '0025', name: 'Indian Overseas Bank', code: '0025' },
  { id: '0026', name: 'IndSusInd Bank', code: '0026' },
  { id: '0027', name: 'J&K Bank', code: '0027' },
  { id: '0028', name: 'Janata Sahakari Bank', code: '0028' },
  { id: '0029', name: 'Karnataka Bank', code: '0029' },
  { id: '0030', name: 'Karur Vysya Bank', code: '0030' },
  { id: '0031', name: 'Kotak Mahindra Bank', code: '0031' },
  { id: '0032', name: 'Lakshmi Vilas Bank', code: '0032' },
  { id: '0033', name: 'Oriental Bank of Commerce', code: '0033' },
  { id: '0034', name: 'P Retail', code: '0034' },
  { id: '0035', name: 'Punjab and Sind Bank', code: '0035' },
  { id: '0036', name: 'RBL Bank', code: '0036' },
  { id: '0037', name: 'Saraswat Bank', code: '0037' },
  { id: '0038', name: 'State Bank of India', code: '0038' },
  { id: '0039', name: 'South Indian Bank', code: '0039' },
  { id: '0040', name: 'Syndicate Bank', code: '0040' },
  { id: '0041', name: 'Tamilnad Mercantile Bank', code: '0041' },
  { id: '0042', name: 'UCO Bank', code: '0042' },
  { id: '0043', name: 'Union Bank of India', code: '0043' },
  { id: '0044', name: 'United Bank of India', code: '0044' },
  { id: '0045', name: 'Vijaya Bank', code: '0045' },
  { id: '0046', name: 'YES Bank', code: '0046' },
  { id: '0047', name: 'Paytm Bank', code: '0047' },
  { id: '0048', name: 'Standard Charter Bank', code: '0048' },
  { id: '0049', name: 'Bandhan Bank', code: '0049' },
  { id: '0050', name: 'Bank of Bahrain and Kuwait', code: '0050' },
  { id: '0051', name: 'DBS Bank Ltd', code: '0051' },
  { id: '0052', name: 'Dhanlaxmi Bank', code: '0052' },
  { id: '0053', name: 'Punjab And Maharashtra Co-operative Bank Limited', code: '0053' },
  { id: '0054', name: 'Shamrao Vithal Co-op. Bank Ltd', code: '0054' },
  { id: '0056', name: 'Suryoday Small Finance Bank Ltd', code: '0056' },
  { id: '0057', name: 'The Bharat Co-op. Bank Ltd', code: '0057' },
  { id: '0058', name: 'The Nainital Bank', code: '0058' },
  { id: '0059', name: 'Ujjivan Small Finance Bank', code: '0059' },
  { id: '0060', name: 'Punjab National Bank Corporate', code: '0060' },
];

// Wallet information
export const wallets: WalletInfo[] = [
  { code: 'FREECHARGE', name: 'Freecharge' },
  { code: 'PAYTM', name: 'Paytm' },
  { code: 'AMAZON_PAY', name: 'Amazon Pay' },
  { code: 'AIRTEL_MONEY', name: 'Airtel Money' },
  { code: 'MOBILEWIK', name: 'Mobikwik' },
  { code: 'OLA_MONEY', name: 'Ola Money' },
  { code: 'OXYGEN', name: 'Oxygen' },
  { code: 'JIO_MONEY', name: 'Jio Money' },
  { code: 'ITZCASH', name: 'Its Cash' },
  { code: 'HDFC_PAYZAPP', name: 'HDFC PayZapp' },
  { code: 'YES_BANK', name: 'Yes Bank' },
];

// Error code mappings
export const errorCodes: Record<string, { message: string; category: string }> = {
  'SPG-0000': { message: 'SUCCESS', category: 'SUCCESS' },
  'SPG-0001': { message: 'FAILED', category: 'BUSINESS' },
  'SPG-0002': { message: 'PENDING', category: 'BUSINESS' },
  'SPG-0003': { message: 'Invalid merchant id', category: 'AUTHENTICATION' },
  'SPG-0004': { message: 'Signature is absent in the request', category: 'AUTHENTICATION' },
  'SPG-0005': { message: 'Invalid signature', category: 'AUTHENTICATION' },
  'SPG-0006': { message: 'Invalid session/ Session expired', category: 'AUTHENTICATION' },
  'SPG-0008': { message: 'Error while validating request', category: 'VALIDATION' },
  'SPG-0009': { message: 'Transaction declined because of expired key', category: 'AUTHENTICATION' },
  'SPG-0010': { message: 'Invalid request field[s]', category: 'VALIDATION' },
  'SPG-0013': { message: 'Request data has been tampered with', category: 'AUTHENTICATION' },
  'SPG-0014': { message: 'Duplicate request for merchant id and merchant txn id', category: 'BUSINESS' },
  'SPG-0015': { message: 'Unable to process request', category: 'TECHNICAL' },
  'SPG-0018': { message: 'Invalid payment mode', category: 'VALIDATION' },
  'SPG-0019': { message: 'Please provide valid payment mode', category: 'VALIDATION' },
  'SPG-0025': { message: 'Transaction does not exist', category: 'BUSINESS' },
  'SPG-0027': { message: 'Payment txn not present for refund request', category: 'BUSINESS' },
  'SPG-0028': { message: 'Duplicate refund request', category: 'BUSINESS' },
  'SPG-0029': { message: 'Refund amount has exceeded the payment amount', category: 'BUSINESS' },
  'SPG-0030': { message: 'Invalid combination of txn reference id & merchant txn', category: 'VALIDATION' },
  'SPG-0031': { message: 'Business exception', category: 'BUSINESS' },
  'SPG-0032': { message: 'Error while making HTTP call', category: 'TECHNICAL' },
  'SPG-0033': { message: 'Invalid card expiry month', category: 'VALIDATION' },
  'SPG-0034': { message: 'Invalid card expiry year', category: 'VALIDATION' },
  'SPG-0035': { message: 'Invalid card cvv', category: 'VALIDATION' },
  'SPG-0036': { message: 'Invalid card number', category: 'VALIDATION' },
  'SPG-0037': { message: 'Card has expired', category: 'VALIDATION' },
  'SPG-0038': { message: 'Client error', category: 'TECHNICAL' },
  'SPG-0039': { message: 'Duplicate combination of merchantId and merchantTxnId', category: 'BUSINESS' },
  'SPG-0040': { message: 'SSL setup error', category: 'TECHNICAL' },
  'SPG-0041': { message: 'Merchant not authorised for the API', category: 'AUTHORIZATION' },
  'SPG-0042': { message: 'Refund amount is more than pay amount', category: 'BUSINESS' },
  'SPG-0044': { message: 'Merchant Id in request does not match that of in pay request', category: 'VALIDATION' },
  'SPG-0047': { message: 'A txn with the combination of merchantId and merchantTxnId already exists', category: 'BUSINESS' },
  'SPG-0048': { message: 'Pay and refund are in different environments', category: 'BUSINESS' },
  'SPG-0049': { message: 'Duplicate authorization request', category: 'BUSINESS' },
  'SPG-5000': { message: 'Internal server error', category: 'TECHNICAL' },
  'SPG-5001': { message: 'Duplicate PG response', category: 'TECHNICAL' },
  'SPG-5002': { message: 'Incorrect combination of mode/submode', category: 'VALIDATION' },
  'SPG-5003': { message: 'PG unavailable', category: 'TECHNICAL' },
  'SPG-5004': { message: 'Invalid card number entered', category: 'VALIDATION' },
  'SPG-5005': { message: 'Invalid bank code', category: 'VALIDATION' },
  'SPG-5006': { message: 'Error from supporting service', category: 'TECHNICAL' },
  'SPG-5007': { message: 'Invalid bank name', category: 'VALIDATION' },
  'SPG-5008': { message: 'Card not supported', category: 'VALIDATION' },
};

// API endpoints
export const API_ENDPOINTS = {
  CHECKOUT: '/payment/v1/checkout',
  TRANSACTION_STATUS: '/payment/v7/txn/status',
  REFUND: '/payment/v3/refund',
} as const;

// Default values
export const DEFAULT_VALUES = {
  CURRENCY: 'INR',
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 1000000,
  TIMEOUT: 30000, // 30 seconds
} as const;
