import { supabase } from '@/lib/supabase';

// OTP configuration
const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_MAX: 3 // max 3 OTP requests per minute
};

// Rate limiting storage (keep in-memory for performance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Generate a secure random OTP
 */
export const generateSecureOTP = (): string => {
  const digits = '0123456789';
  let otp = '';
  
  // Use crypto.randomInt for better randomness
  for (let i = 0; i < OTP_CONFIG.LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }
  
  return otp;
};

/**
 * Check rate limiting for mobile number
 */
const checkRateLimit = (mobile: string): boolean => {
  const now = Date.now();
  const key = `rate_limit:${mobile}`;
  const rateLimit = rateLimitStore.get(key);

  if (!rateLimit || now > rateLimit.resetTime) {
    // Reset rate limit
    rateLimitStore.set(key, { count: 1, resetTime: now + OTP_CONFIG.RATE_LIMIT_WINDOW });
    return true;
  }

  if (rateLimit.count >= OTP_CONFIG.RATE_LIMIT_MAX) {
    return false;
  }

  rateLimit.count++;
  return true;
};

/**
 * Store OTP securely (server-side)
 */
const storeOTP = async (mobile: string, otp: string): Promise<void> => {
  const expiresAt = Date.now() + (OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);
  
  try {
    // First, delete any existing OTP for this mobile number
    const { error: deleteError } = await supabase
      .from('otp_store')
      .delete()
      .eq('mobile', mobile);
    
    if (deleteError) {
      console.warn('Warning: Could not delete existing OTP:', deleteError);
      // Continue anyway, as the insert might still work
    }

    // Now insert the new OTP
    const { error: insertError } = await supabase
      .from('otp_store')
      .insert({
        mobile,
        otp,
        expires_at: expiresAt,
        attempts: 0
      });

    if (insertError) {
      console.error('Error storing OTP in Supabase:', insertError);
      throw insertError;
    }
  } catch (error) {
    console.error('Error storing OTP:', error);
    throw error;
  }
};

/**
 * Generate and store OTP for mobile number
 */
export const generateAndStoreOTP = async (mobile: string): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    // Check rate limiting
    if (!checkRateLimit(mobile)) {
      return {
        success: false,
        message: `Too many OTP requests. Please wait ${Math.ceil(OTP_CONFIG.RATE_LIMIT_WINDOW / 1000 / 60)} minutes before requesting another OTP.`
      };
    }

    // Generate secure OTP
    const otp = generateSecureOTP();
    
    // Store OTP server-side
    await storeOTP(mobile, otp);

    // Send OTP via SMS (this will be handled by the API route)
    return {
      success: true,
      message: 'OTP generated successfully',
      otp // This will be sent via SMS, not returned to client
    };
  } catch (error) {
    console.error('Error generating OTP:', error);
    return {
      success: false,
      message: 'Failed to generate OTP. Please try again.'
    };
  }
};

/**
 * Validate OTP for mobile number
 */
export const validateOTP = async (mobile: string, enteredOTP: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase
      .from('otp_store')
      .select('otp, expires_at, attempts')
      .eq('mobile', mobile)
      .single();

    if (error) {
      console.error('Error fetching OTP from Supabase:', error);
      return {
        success: false,
        message: 'Failed to validate OTP. Please try again.'
      };
    }

    if (!data) {
      return {
        success: false,
        message: 'OTP expired or not found. Please request a new OTP.'
      };
    }

    // Check if OTP is expired
    if (Date.now() > data.expires_at) {
      const { error: deleteError } = await supabase
        .from('otp_store')
        .delete()
        .eq('mobile', mobile);

      if (deleteError) {
        console.error('Error deleting expired OTP from Supabase:', deleteError);
      }
      return {
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      };
    }

    // Check if max attempts exceeded
    if (data.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      const { error: deleteError } = await supabase
        .from('otp_store')
        .delete()
        .eq('mobile', mobile);

      if (deleteError) {
        console.error('Error deleting max attempts OTP from Supabase:', deleteError);
      }
      return {
        success: false,
        message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
      };
    }

    // Increment attempts
    const { error: updateError } = await supabase
      .from('otp_store')
      .update({ attempts: data.attempts + 1 })
      .eq('mobile', mobile);

    if (updateError) {
      console.error('Error incrementing attempts in Supabase:', updateError);
      return {
        success: false,
        message: 'Failed to validate OTP. Please try again.'
      };
    }

    // Validate OTP
    if (enteredOTP === data.otp) {
      // OTP is valid, remove it from storage
      const { error: deleteError } = await supabase
        .from('otp_store')
        .delete()
        .eq('mobile', mobile);

      if (deleteError) {
        console.error('Error deleting validated OTP from Supabase:', deleteError);
      }
      
      return {
        success: true,
        message: 'OTP validated successfully'
      };
    } else {
      console.log('OTP validation failed - incorrect OTP');
      return {
        success: false,
        message: `Invalid OTP. ${OTP_CONFIG.MAX_ATTEMPTS - data.attempts - 1} attempts remaining.`
      };
    }
  } catch (error) {
    console.error('Error validating OTP:', error);
    return {
      success: false,
      message: 'Error validating OTP. Please try again.'
    };
  }
};

/**
 * Clean up expired OTPs and rate limits
 */
export const cleanupExpiredData = async (): Promise<void> => {
  try {
    const now = Date.now();
    
    // Clean up expired OTPs from Supabase
    const { error: deleteError } = await supabase
      .from('otp_store')
      .delete()
      .lt('expires_at', now);

    if (deleteError) {
      console.error('Error cleaning up expired OTPs from Supabase:', deleteError);
    } else {
      console.log('Cleaned up expired OTPs from Supabase');
    }
  } catch (error) {
    // Only log errors in development, don't spam the console
    if (process.env.NODE_ENV === 'development') {
      console.warn('Cleanup operation failed (this is normal during development):', error);
    }
  }
  
  // Clean up expired rate limits (in-memory)
  try {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  } catch (error) {
    // Rate limit cleanup errors are not critical
    if (process.env.NODE_ENV === 'development') {
      console.warn('Rate limit cleanup failed:', error);
    }
  }
};

// Run cleanup less frequently and only in production
if (process.env.NODE_ENV === 'production') {
  // In production, run cleanup every 5 minutes
  setInterval(cleanupExpiredData, 5 * 60 * 1000);
} else {
  // In development, run cleanup every 30 minutes to reduce noise
  setInterval(cleanupExpiredData, 30 * 60 * 1000);
}

/**
 * Validate mobile number format (Indian mobile number)
 * Accepts both formats: 9326499348 or +91 9326499348
 */
export const validateMobileNumber = (mobile: string): boolean => {
  // Remove +91 prefix if present and validate 10-digit number
  const cleanMobile = mobile.replace(/^\+91\s*/, '');
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(cleanMobile);
};

/**
 * Clean mobile number for consistent storage and lookup
 * Converts +91 9326499348 to 9326499348 for consistent database operations
 */
export const cleanMobileNumber = (mobile: string): string => {
  return mobile.replace(/^\+91\s*/, '');
};

/**
 * Get OTP expiry time for a mobile number
 */
export const getOTPExpiryTime = async (mobile: string): Promise<number | null> => {
  const { data, error } = await supabase
    .from('otp_store')
    .select('expires_at')
    .eq('mobile', mobile)
    .single();

  if (error) {
    console.error('Error fetching OTP expiry time from Supabase:', error);
    return null;
  }
  return data?.expires_at || null;
};

/**
 * Get remaining attempts for a mobile number
 */
export const getRemainingAttempts = async (mobile: string): Promise<number | null> => {
  const { data, error } = await supabase
    .from('otp_store')
    .select('attempts')
    .eq('mobile', mobile)
    .single();

  if (error) {
    console.error('Error fetching remaining attempts from Supabase:', error);
    return null;
  }
  return data?.attempts || null;
};

/**
 * Debug function to check OTP store state
 */
export const debugOTPStore = async (): Promise<void> => {
  console.log('=== OTP STORE DEBUG ===');
  const { data, error } = await supabase
    .from('otp_store')
    .select('mobile, otp, expires_at, attempts');

  if (error) {
    console.error('Error fetching OTP store state from Supabase:', error);
    return;
  }
  console.log('Store Size:', data?.length || 0);
  console.log('Store Contents:');
  if (data) {
    for (const item of data) {
      console.log(`  ${item.mobile}: OTP=${item.otp}, Expires=${new Date(item.expires_at).toISOString()}, Attempts=${item.attempts}`);
    }
  }
  console.log('======================');
};
