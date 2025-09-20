// Acefone API Configuration for Masked Calling
export const ACEFONE_CONFIG = {
  // API Endpoints
  BASE_URL: 'https://api.acefone.in/v1',
  AUTH_URL: 'https://api.acefone.in/v1/auth/login',
  CALL_URL: 'https://api.acefone.in/v1/click_to_call',
  
  // Your DID Number for India
  DID_NUMBER: '08065343250',
  
  // API Credentials (from environment variables)
  API_TOKEN: process.env.ACEFONE_API_TOKEN || '',
  USERNAME: process.env.ACEFONE_USERNAME || '',
  PASSWORD: process.env.ACEFONE_PASSWORD || '',
  
  // Call Configuration
  CALL_SETTINGS: {
    // Ring duration in seconds
    RING_DURATION: 30,
    
    // Call recording settings
    RECORD_CALL: false,
    
    // Call timeout in seconds
    CALL_TIMEOUT: 60,
    
    // Number masking enabled
    MASK_NUMBERS: true,
    
    // India country code
    COUNTRY_CODE: '+91'
  }
} as const;

// Call types for different scenarios
export const CALL_TYPES = {
  PARTNER_TO_CUSTOMER: 'partner_to_customer',
  CUSTOMER_TO_PARTNER: 'customer_to_partner',
  SUPPORT_CALL: 'support_call'
} as const;

// Call status tracking
export const CALL_STATUS = {
  INITIATED: 'initiated',
  RINGING: 'ringing',
  CONNECTED: 'connected',
  FAILED: 'failed',
  COMPLETED: 'completed',
  BUSY: 'busy',
  NO_ANSWER: 'no_answer'
} as const;

export type CallType = typeof CALL_TYPES[keyof typeof CALL_TYPES];
export type CallStatus = typeof CALL_STATUS[keyof typeof CALL_STATUS];
