import { validateMobileNumber } from "@/services/otpService";

// Define proper types for error handling
export interface DatabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
  [key: string]: unknown;
}

// Define proper types for user data
interface BaseUser {
  id: number | string;
  name: string;
  email?: string;
  status?: string;
}

interface AdminUser extends BaseUser {
  phone: string;
  role: string;
}

interface PartnerUser extends BaseUser {
  mobile: string;
  service_type: string;
  user_role?: string;
}

type UserData = AdminUser | PartnerUser;

/**
 * Common mobile number validation and sanitization
 */
export const validateAndSanitizeMobile = (mobile: string) => {
  if (!mobile) {
    return {
      isValid: false,
      error: "Mobile number is required",
      status: 400
    };
  }

  // Sanitize mobile number (remove any non-digit characters)
  const sanitizedMobile = mobile.replace(/\D/g, '');

  // Validate mobile number format
  if (!validateMobileNumber(sanitizedMobile)) {
    return {
      isValid: false,
      error: "Invalid mobile number format. Please enter a valid 10-digit Indian mobile number.",
      status: 400
    };
  }

  return {
    isValid: true,
    sanitizedMobile,
    error: null,
    status: null
  };
};

/**
 * Common database error handling for user validation
 */
export const handleUserValidationError = (error: DatabaseError) => {
  console.error("Database error:", error);
  
  // Check if it's a "no rows returned" error (mobile number not found)
  if (error.code === 'PGRST116' || 
      (error.message && error.message.includes('No rows returned'))) {
    return {
      error: "Mobile number not registered. Please check and try again.",
      code: "MOBILE_NOT_FOUND",
      status: 404
    };
  }
  
  // For other database errors, return a user-friendly message
  return {
    error: "Unable to verify mobile number. Please try again later.",
    status: 500,
    code: undefined
  };
};

/**
 * Common success response for user validation
 */
export const createUserValidationSuccess = (user: UserData, userType: 'admin' | 'partner') => {
  const baseUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status
  };

  if (userType === 'admin') {
    const adminUser = user as AdminUser;
    return {
      success: true,
      message: "Admin user found",
      user: {
        ...baseUser,
        phone: adminUser.phone,
        role: adminUser.role
      }
    };
  } else {
    const partnerUser = user as PartnerUser;
    return {
      success: true,
      message: "Partner user found",
      user: {
        ...baseUser,
        mobile: partnerUser.mobile,
        service_type: partnerUser.service_type,
        user_role: partnerUser.user_role || 'partner'
      }
    };
  }
};
