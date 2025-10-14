// Enhanced Security Utilities for Production
import crypto from 'crypto';
import { environmentConfig } from '@/config/environment';

export class SecurityUtils {
  // Rate limiting storage (in production, use Redis)
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  
  // IP whitelist for production
  private static allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];
  
  /**
   * Enhanced signature verification with additional security checks
   */
  static verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    webhookSecret?: string
  ): boolean {
    try {
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret || environmentConfig.razorpay.webhookSecret)
        .update(body)
        .digest('hex');
      
      // Use timing-safe comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(razorpaySignature, 'hex')
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }
  
  /**
   * Rate limiting for API endpoints
   */
  static checkRateLimit(
    identifier: string,
    windowMs: number = environmentConfig.security.rateLimitWindow,
    maxRequests: number = environmentConfig.security.rateLimitMax
  ): boolean {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    const current = this.rateLimitStore.get(key);
    
    if (!current || now > current.resetTime) {
      // Reset or create new entry
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }
    
    if (current.count >= maxRequests) {
      return false;
    }
    
    current.count++;
    this.rateLimitStore.set(key, current);
    return true;
  }
  
  /**
   * IP address validation
   */
  static isAllowedIP(ip: string): boolean {
    if (!environmentConfig.isProduction) {
      return true; // Allow all IPs in development
    }
    
    if (this.allowedIPs.length === 0) {
      return true; // No restrictions if no IPs configured
    }
    
    return this.allowedIPs.includes(ip);
  }
  
  /**
   * Sanitize input data
   */
  static sanitizeInput(input: unknown): unknown {
    if (typeof input === 'string') {
      return input
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .trim()
        .substring(0, 1000); // Limit length
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(input)) {
        if (key.length <= 100) { // Limit key length
          sanitized[key] = this.sanitizeInput(value);
        }
      }
      return sanitized;
    }
    
    return input;
  }
  
  /**
   * Validate amount with production limits
   */
  static validateAmount(amount: number): { valid: boolean; error?: string } {
    const config = environmentConfig.razorpay;
    const limits = environmentConfig.isProduction ? config.production : config.sandbox;
    
    if (isNaN(amount) || amount <= 0) {
      return { valid: false, error: 'Invalid amount' };
    }
    
    if (amount < limits.minAmount) {
      return { valid: false, error: `Minimum amount is ₹${limits.minAmount}` };
    }
    
    if (amount > limits.maxAmount) {
      return { valid: false, error: `Maximum amount is ₹${limits.maxAmount}` };
    }
    
    // Check for suspicious amounts in production
    if (environmentConfig.isProduction) {
      // Flag amounts that are too round (potential test amounts)
      if (amount % 1000 === 0 && amount > 10000) {
        console.warn(`Suspicious round amount detected: ${amount}`);
      }
      
      // Flag very large amounts
      if (amount > 1000000) {
        console.warn(`Large amount transaction: ${amount}`);
      }
    }
    
    return { valid: true };
  }
  
  /**
   * Generate secure transaction ID
   */
  static generateSecureTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(8).toString('hex');
    return `TXN_${timestamp}_${random}`.toUpperCase();
  }
  
  /**
   * Encrypt sensitive data
   */
  static encryptSensitiveData(data: string): string {
    if (!environmentConfig.security.encryptionKey) {
      throw new Error('Encryption key not configured');
    }
    
    const cipher = crypto.createCipher('aes-256-cbc', environmentConfig.security.encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  }
  
  /**
   * Decrypt sensitive data
   */
  static decryptSensitiveData(encryptedData: string): string {
    if (!environmentConfig.security.encryptionKey) {
      throw new Error('Encryption key not configured');
    }
    
    const decipher = crypto.createDecipher('aes-256-cbc', environmentConfig.security.encryptionKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Log security events
   */
  static logSecurityEvent(event: string, details: Record<string, unknown>, severity: 'low' | 'medium' | 'high' = 'medium') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      severity,
      details: this.sanitizeInput(details),
      environment: environmentConfig.isProduction ? 'production' : 'development'
    };
    
    if (severity === 'high' || environmentConfig.isProduction) {
      console.error('SECURITY_EVENT:', logEntry);
    } else {
      console.warn('SECURITY_EVENT:', logEntry);
    }
  }
}

// Middleware for rate limiting
export const rateLimitMiddleware = (req: Request, res: Response, next: () => void) => {
  const identifier = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  if (!SecurityUtils.checkRateLimit(identifier)) {
    SecurityUtils.logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip: identifier }, 'medium');
    // Return error response
    return Response.json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.'
    }, { status: 429 });
  }
  
  next();
};

// Middleware for IP validation
export const ipValidationMiddleware = (req: Request, res: Response, next: () => void) => {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  if (!SecurityUtils.isAllowedIP(ip)) {
    SecurityUtils.logSecurityEvent('UNAUTHORIZED_IP', { ip }, 'high');
    // Return error response
    return Response.json({
      error: 'Access denied',
      message: 'Your IP address is not authorized.'
    }, { status: 403 });
  }
  
  next();
};
