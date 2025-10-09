// Acefone API Configuration
// This file contains configuration for Acefone API Dialplan integration

export const ACEFONE_CONFIG = {
  // API Credentials
  API_TOKEN: process.env.ACEFONE_API_TOKEN || '',
  USERNAME: process.env.ACEFONE_USERNAME || '',
  PASSWORD: process.env.ACEFONE_PASSWORD || '',
  
  // DID Number Configuration
  DID_NUMBER: '8065343250', // Your DID number from Acefone
  
  // API Endpoints
  BASE_URL: 'https://console.acefone.in',
  WEBHOOK_URL: (process.env.NEXT_PUBLIC_BASE_URL || 'https://nakoda-partner.vercel.app') + '/api/acefone-dialplan',
  
  // Call Configuration
  RING_TYPE: 'order_by', // Ring strategy for transfers
  SKIP_ACTIVE: false, // Whether to skip active agents
  CALL_TIMEOUT: 30000, // 30 seconds timeout
  
  // Transfer Types
  TRANSFER_TYPES: {
    NUMBER: 'number',
    AGENT: 'agent',
    IVR: 'ivr',
    AUTO_ATTENDANT: 'auto_attendant',
    DEPARTMENT: 'department'
  },
  
  // Call Types
  CALL_TYPES: {
    PARTNER_TO_CUSTOMER: 'partner_to_customer',
    CUSTOMER_TO_PARTNER: 'customer_to_partner',
    SUPPORT_CALL: 'support_call',
    DELIVERY_CALL: 'delivery_call'
  },
  
  // Call Status
  CALL_STATUS: {
    INITIATED: 'initiated',
    RINGING: 'ringing',
    CONNECTED: 'connected',
    FAILED: 'failed',
    COMPLETED: 'completed',
    BUSY: 'busy',
    NO_ANSWER: 'no_answer',
    CANCELLED: 'cancelled'
  },
  
  // Call Quality
  CALL_QUALITY: {
    EXCELLENT: 'excellent',
    GOOD: 'good',
    FAIR: 'fair',
    POOR: 'poor',
    UNKNOWN: 'unknown'
  }
} as const;

// Validation function to check if all required credentials are present
export const validateAcefoneConfig = (): boolean => {
  const required = [
    ACEFONE_CONFIG.API_TOKEN,
    ACEFONE_CONFIG.USERNAME,
    ACEFONE_CONFIG.PASSWORD,
    ACEFONE_CONFIG.DID_NUMBER
  ];
  
  return required.every(value => value && value.trim() !== '');
};

// Helper function to format phone numbers for Acefone API
export const formatPhoneForAcefone = (phoneNumber: string): string => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Remove country code if present
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  
  // Ensure exactly 10 digits
  if (cleaned.length === 10) {
    return cleaned;
  }
  
  // Take last 10 digits if longer
  if (cleaned.length > 10) {
    return cleaned.slice(-10);
  }
  
  throw new Error(`Invalid phone number format: ${phoneNumber}`);
};

// Helper function to generate phone number formats for database lookup
export const generatePhoneFormats = (phoneNumber: string): string[] => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const formats: string[] = [];
  
  // Add original format
  formats.push(cleaned);
  
  // Add 10-digit format (remove country code)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    formats.push(cleaned.substring(2));
  }
  
  // Add with country code
  if (cleaned.length === 10) {
    formats.push(`91${cleaned}`);
    formats.push(`+91${cleaned}`);
  }
  
  // Add with + prefix
  if (!cleaned.startsWith('+')) {
    formats.push(`+${cleaned}`);
  }
  
  return [...new Set(formats)]; // Remove duplicates
};

export default ACEFONE_CONFIG;
