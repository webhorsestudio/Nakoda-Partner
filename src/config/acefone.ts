// Acefone API Dialplan Configuration for Masked Calling
// Based on: https://docs.acefone.in/docs/api-dialplan

export const ACEFONE_CONFIG = {
  // Your DID Number for India (this is what customers will call)
  DID_NUMBER: '08065343250',
  
  // API Dialplan Configuration
  API_DIALPLAN: {
    // Your endpoint that Acefone will call when someone dials your DID
    WEBHOOK_URL: (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/api/acefone-dialplan',
    
    // Request method (GET or POST)
    REQUEST_METHOD: 'POST',
    
    // Failover destination (what happens if your API fails)
    FAILOVER_DESTINATION: 'voicemail', // or 'hangup', 'ivr', etc.
  },
  
  // Call Settings
  CALL_SETTINGS: {
    // Ring strategy for transfers
    RING_TYPE: 'order_by', // 'order_by' or 'simultaneous'
    
    // Skip active agents (don't ring busy agents)
    SKIP_ACTIVE: true,
    
    // Music on hold ID (optional)
    MUSIC_ON_HOLD: null, // Set to recording ID if you have MOH
    
    // Call timeout in seconds
    CALL_TIMEOUT: 30,
    
    // Disable call recording for specific calls (optional)
    DISABLE_CALL_RECORDING: false,
  },
  
  // Transfer Types
  TRANSFER_TYPES: {
    NUMBER: 'number',        // Transfer to phone number
    AGENT: 'agent',          // Transfer to agent ID
    EXTENSION: 'extension',   // Transfer to agent extension
    IVR: 'ivr',              // Transfer to IVR
    AUTO_ATTENDANT: 'auto_attendant', // Transfer to auto-attendant
    DEPARTMENT: 'department'  // Transfer to department
  },
  
  // Ring Types
  RING_TYPES: {
    ORDER_BY: 'order_by',      // Ring agents one by one
    SIMULTANEOUS: 'simultaneous' // Ring all agents at once
  }
} as const;

// Call status tracking
export const CALL_STATUS = {
  INITIATED: 'initiated',
  RINGING: 'ringing', 
  CONNECTED: 'connected',
  FAILED: 'failed',
  COMPLETED: 'completed',
  BUSY: 'busy',
  NO_ANSWER: 'no_answer',
  CANCELLED: 'cancelled'
} as const;

// Call types for different scenarios
export const CALL_TYPES = {
  PARTNER_TO_CUSTOMER: 'partner_to_customer',
  CUSTOMER_TO_PARTNER: 'customer_to_partner',
  SUPPORT_CALL: 'support_call',
  DELIVERY_CALL: 'delivery_call'
} as const;

export type CallStatus = typeof CALL_STATUS[keyof typeof CALL_STATUS];
export type CallType = typeof CALL_TYPES[keyof typeof CALL_TYPES];
