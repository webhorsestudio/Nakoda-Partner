// Razorpay Configuration
export const razorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID || '',
  keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
};

// Currency and amount limits
export const razorpayLimits = {
  minAmount: 1, // ₹1
  maxAmount: 10000000, // ₹1 crore
  currency: 'INR',
};
