import jwt from 'jsonwebtoken';

// JWT configuration
const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  EXPIRES_IN: '24h' as const,
  REFRESH_EXPIRES_IN: '7d' as const
};

// Debug: Log JWT configuration
console.log('=== JWT CONFIG DEBUG ===');
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES' : 'NO');
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
console.log('Using fallback secret:', !process.env.JWT_SECRET);
console.log('========================');

// Token payload interface
export interface TokenPayload {
  userId: number;
  email: string;
  phone: string; // Add phone/mobile field
  mobile?: string; // Add mobile field for compatibility
  role: string;
  permissions?: string[]; // Optional permissions for RBAC decoding
  access_level?: string; // Optional access level
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token
 */
export const generateJWTToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.EXPIRES_IN,
    issuer: 'nakoda-partner',
    audience: 'admin-users'
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.REFRESH_EXPIRES_IN,
    issuer: 'nakoda-partner',
    audience: 'admin-users'
  });
};

/**
 * Verify JWT token
 */
export const verifyJWTToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET, {
      issuer: 'nakoda-partner',
      audience: 'admin-users'
    }) as TokenPayload;
    
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

/**
 * Decode JWT token without verification (for debugging only)
 */
export const decodeJWTToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    console.error('JWT decode failed:', error);
    return null;
  }
};

/**
 * Client-safe JWT verification (for browser environment)
 * This function only decodes the token without cryptographic verification
 * For production, consider using a proper JWT library that works in browsers
 */
export const verifyJWTTokenClient = (token: string): TokenPayload | null => {
  try {
    // Simple base64 decode and JSON parse for client-side
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.error('Invalid JWT token format');
      return null;
    }
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const decoded = JSON.parse(jsonPayload) as TokenPayload;
    
    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.log('JWT token expired');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Client-side JWT verification failed:', error);
    return null;
  }
};

/**
 * Generate a simple secure token for client-side use
 * This is a fallback when JWT doesn't work in the browser
 */
export const generateSimpleToken = (payload: TokenPayload): string => {
  const data = {
    ...payload,
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
    iat: Date.now()
  };
  
  // Create a simple encoded token
  const jsonString = JSON.stringify(data);
  const encoded = btoa(encodeURIComponent(jsonString));
  
  return encoded;
};

/**
 * Verify a simple token (for client-side use)
 */
export const verifySimpleToken = (token: string): TokenPayload | null => {
  try {
    const decoded = JSON.parse(decodeURIComponent(atob(token))) as TokenPayload;
    
    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp) {
      console.log('Simple token expired');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Simple token verification failed:', error);
    return null;
  }
};

/**
 * Generate secure cookie options
 */
export const getSecureCookieOptions = (isHttpOnly: boolean = true) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: isHttpOnly,
    secure: isProduction, // Only use HTTPS in production
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined
  };
};

/**
 * Generate refresh cookie options
 */
export const getRefreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined
  };
};

/**
 * Set secure authentication cookies
 */
export const setAuthCookies = (response: Response, accessToken: string, refreshToken: string): Response => {
  const accessCookieOptions = getSecureCookieOptions(true);
  const refreshCookieOptions = getRefreshCookieOptions();

  // Set access token cookie
  response.headers.append('Set-Cookie', 
    `access-token=${accessToken}; HttpOnly; Secure=${accessCookieOptions.secure}; SameSite=${accessCookieOptions.sameSite}; Path=${accessCookieOptions.path}; Max-Age=${accessCookieOptions.maxAge}`
  );

  // Set refresh token cookie
  response.headers.append('Set-Cookie', 
    `refresh-token=${refreshToken}; HttpOnly; Secure=${refreshCookieOptions.secure}; SameSite=${refreshCookieOptions.sameSite}; Path=${refreshCookieOptions.path}; Max-Age=${refreshCookieOptions.maxAge}`
  );

  return response;
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = (response: Response): Response => {
  response.headers.append('Set-Cookie', 
    'access-token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  );
  
  response.headers.append('Set-Cookie', 
    'refresh-token=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  );

  return response;
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWTToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * Get token expiration time
 */
export const getTokenExpirationTime = (token: string): Date | null => {
  const decoded = decodeJWTToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  
  return new Date(decoded.exp * 1000);
};

// Role-based access control functions
export interface UserPermissions {
  role: string;
  permissions: string[];
  access_level: string;
}

export function hasPermission(userPermissions: UserPermissions | null, requiredPermission: string): boolean {
  if (!userPermissions) return false;
  
  // Super Admin has all permissions
  if (userPermissions.role === 'Super Admin' || userPermissions.access_level === 'Full Access') {
    return true;
  }
  
  // Check specific permission
  return userPermissions.permissions.includes(requiredPermission);
}

export function canAccessPartners(userPermissions: UserPermissions | null): boolean {
  return hasPermission(userPermissions, 'Partner Management');
}

export function canAccessOrders(userPermissions: UserPermissions | null): boolean {
  return hasPermission(userPermissions, 'Order Management');
}

export function canAccessUsers(userPermissions: UserPermissions | null): boolean {
  return hasPermission(userPermissions, 'User Management');
}

export function canAccessSettings(userPermissions: UserPermissions | null): boolean {
  return hasPermission(userPermissions, 'System Settings');
}

// Decode user permissions from JWT token
export function decodeUserPermissions(token: string): UserPermissions | null {
  try {
    // Try JWT first
    const decoded = verifyJWTTokenClient(token);
    if (decoded && decoded.permissions) {
      return {
        role: decoded.role || 'Unknown',
        permissions: decoded.permissions || [],
        access_level: decoded.access_level || 'Unknown'
      };
    }
    
    // Fallback to simple token
    const simpleDecoded = verifySimpleToken(token);
    if (simpleDecoded && simpleDecoded.permissions) {
      return {
        role: simpleDecoded.role || 'Unknown',
        permissions: simpleDecoded.permissions || [],
        access_level: simpleDecoded.access_level || 'Unknown'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error decoding user permissions:', error);
    return null;
  }
}
