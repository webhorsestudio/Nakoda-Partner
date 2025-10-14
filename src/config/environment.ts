// Environment Configuration for Production Deployment
export const environmentConfig = {
  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Razorpay configuration
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    environment: process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_') ? 'sandbox' : 'production',
    
    // Production-specific settings
    production: {
      minAmount: 1, // ₹1 minimum
      maxAmount: 10000000, // ₹1 crore maximum
      currency: 'INR',
      timeout: 30000, // 30 seconds timeout
      retryAttempts: 3,
    },
    
    // Sandbox-specific settings
    sandbox: {
      minAmount: 1,
      maxAmount: 100000, // Lower limit for testing
      currency: 'INR',
      timeout: 15000, // 15 seconds timeout
      retryAttempts: 2,
    }
  },
  
  // Security settings
  security: {
    jwtSecret: process.env.JWT_SECRET || '',
    encryptionKey: process.env.ENCRYPTION_KEY || '',
    rateLimitWindow: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000, // 15 min in prod, 1 min in dev
    rateLimitMax: process.env.NODE_ENV === 'production' ? 100 : 1000, // Lower limit in production
  },
  
  // Monitoring and logging
  monitoring: {
    enableDetailedLogging: process.env.NODE_ENV === 'production',
    logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    enableMetrics: process.env.NODE_ENV === 'production',
    enableAlerts: process.env.NODE_ENV === 'production',
  },
  
  // Database settings
  database: {
    enableQueryLogging: process.env.NODE_ENV === 'development',
    enableSlowQueryLogging: process.env.NODE_ENV === 'production',
    connectionTimeout: process.env.NODE_ENV === 'production' ? 30000 : 10000,
  },
  
  // Feature flags
  features: {
    enableWebhooks: process.env.NODE_ENV === 'production',
    enableAdvancedSecurity: process.env.NODE_ENV === 'production',
    enableTransactionMonitoring: process.env.NODE_ENV === 'production',
    enableAutoRetry: process.env.NODE_ENV === 'production',
  }
};

// Helper functions
export const isProduction = () => environmentConfig.isProduction;
export const isDevelopment = () => environmentConfig.isDevelopment;
export const isSandbox = () => environmentConfig.razorpay.environment === 'sandbox';
export const isLive = () => environmentConfig.razorpay.environment === 'production';

// Get current Razorpay config based on environment
export const getRazorpayConfig = () => {
  const baseConfig = environmentConfig.razorpay;
  const envSpecificConfig = isSandbox() ? baseConfig.sandbox : baseConfig.production;
  
  return {
    ...baseConfig,
    ...envSpecificConfig,
  };
};
