import jwt from 'jsonwebtoken';
import { isWebView } from './webViewUtils';

// JWT configuration
const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  EXPIRES_IN: '7d' as const,  // Extended to 7 days for better session persistence
  REFRESH_EXPIRES_IN: '30d' as const
};


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
    console.error('❌ JWT verification failed:', error);
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
    // Validate token format first
    if (!token || typeof token !== 'string') {
      console.error('Invalid JWT token: token is empty or not a string');
      return null;
    }

    // Check if token has JWT format (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token format: expected 3 parts, got', parts.length);
      return null;
    }

    const base64Url = parts[1];
    if (!base64Url) {
      console.error('Invalid JWT token format: missing payload');
      return null;
    }
    
    // Add padding if needed
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    let jsonPayload: string;
    try {
      jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    } catch (atobError) {
      console.error('JWT payload base64 decode failed:', atobError);
      return null;
    }
    
    let decoded: TokenPayload;
    try {
      decoded = JSON.parse(jsonPayload) as TokenPayload;
    } catch (jsonError) {
      console.error('JWT payload JSON parse failed:', jsonError);
      return null;
    }
    
    // Validate required fields
    if (!decoded || typeof decoded !== 'object') {
      console.error('Invalid JWT token: decoded payload is not an object');
      return null;
    }
    
    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
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
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
    iat: Date.now()
  };
  
  // Create a simple encoded token
  const jsonString = JSON.stringify(data);
  const encoded = btoa(encodeURIComponent(jsonString));
  
  return encoded;
};

/**
 * Debug token format and content (for development only)
 */
export const debugToken = (token: string): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  
  // Check if it looks like JWT
  const parts = token.split('.');
  if (parts.length === 3) {
    // JWT format detected
  } else {
    // Simple token format
  }
  
  // Check base64 validity
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  
  // Try to decode safely
  try {
    if (parts.length === 3) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
      const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      // JWT payload decoded
    } else {
      const decoded = JSON.parse(decodeURIComponent(atob(token)));
      // Simple token decoded
    }
  } catch (error) {
    // Decode error
  }
};

/**
 * Verify a simple token (for client-side use)
 */
export const verifySimpleToken = (token: string): TokenPayload | null => {
  try {
    // Validate token format first
    if (!token || typeof token !== 'string') {
      console.error('Invalid token: token is empty or not a string');
      return null;
    }

    // Check if token looks like base64 (basic validation)
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(token)) {
      console.error('Invalid token: not base64 encoded');
      return null;
    }

    // Try to decode the token
    let decodedString: string;
    try {
      decodedString = decodeURIComponent(atob(token));
    } catch (atobError) {
      console.error('Token base64 decode failed:', atobError);
      return null;
    }

    // Try to parse as JSON
    let decoded: TokenPayload;
    try {
      decoded = JSON.parse(decodedString) as TokenPayload;
    } catch (jsonError) {
      console.error('Token JSON parse failed:', jsonError);
      return null;
    }
    
    // Validate required fields
    if (!decoded || typeof decoded !== 'object') {
      console.error('Invalid token: decoded data is not an object');
      return null;
    }

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp) {
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
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for better session persistence
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
 * Enhanced WebView session persistence
 * Handles Flutter WebView specific session management
 */
export const setWebViewPersistentSession = (token: string): void => {
  if (typeof window === 'undefined') return;
  
  console.log('🔧 Setting WebView persistent session...');
  
  // 1. Set localStorage (primary storage)
  localStorage.setItem('auth-token', token);
  
  // 2. Set sessionStorage (backup for WebView)
  sessionStorage.setItem('auth-token', token);
  
  // 3. Set multiple cookie formats for maximum compatibility
  const cookieExpiry = 7 * 24 * 60 * 60; // 7 days in seconds
  const isSecure = window.location.protocol === 'https:';
  
  // Standard cookie
  const standardCookie = `auth-token=${token}; path=/; max-age=${cookieExpiry}; SameSite=Lax; ${isSecure ? 'Secure' : ''}`;
  document.cookie = standardCookie;
  
  // WebView-specific cookie (more permissive)
  const webViewCookie = `webview-auth-token=${token}; path=/; max-age=${cookieExpiry}; SameSite=None; ${isSecure ? 'Secure' : ''}`;
  document.cookie = webViewCookie;
  
  // 4. Store in IndexedDB for maximum persistence (WebView fallback)
  if ('indexedDB' in window) {
    try {
      const request = indexedDB.open('WebViewSession', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions');
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['sessions'], 'readwrite');
        const store = transaction.objectStore('sessions');
        store.put(token, 'auth-token');
        console.log('✅ Token stored in IndexedDB');
      };
    } catch (error) {
      console.warn('⚠️ IndexedDB not available:', error);
    }
  }
  
  // 5. Send session info to Flutter (if available)
  if (typeof window !== 'undefined' && (window as unknown as { flutter_inappwebview?: unknown }).flutter_inappwebview) {
    try {
      (window as unknown as { flutter_inappwebview: { callHandler: (name: string, data: Record<string, unknown>) => void } }).flutter_inappwebview.callHandler('webViewMessage', {
        type: 'session_created',
        token: token.substring(0, 20) + '...', // Don't send full token for security
        timestamp: new Date().toISOString()
      });
      console.log('✅ Session info sent to Flutter');
    } catch (error) {
      console.warn('⚠️ Failed to send session info to Flutter:', error);
    }
  }
  
  console.log('✅ WebView persistent session set with multiple fallbacks');
};

/**
 * Enhanced WebView session clearing
 * Clears all storage methods used by WebView
 */
export const clearWebViewSession = (): void => {
  if (typeof window === 'undefined') return;
  
  console.log('🧹 Clearing WebView session from all storage methods...');
  
  // 1. Clear localStorage
  localStorage.removeItem('auth-token');
  
  // 2. Clear sessionStorage
  sessionStorage.removeItem('auth-token');
  
  // 3. Clear all cookies
  document.cookie = 'auth-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
  document.cookie = 'webview-auth-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None';
  
  // 4. Clear IndexedDB
  if ('indexedDB' in window) {
    try {
      const request = indexedDB.open('WebViewSession', 1);
      request.onsuccess = () => {
        const db = request.result;
        if (db.objectStoreNames.contains('sessions')) {
          const transaction = db.transaction(['sessions'], 'readwrite');
          const store = transaction.objectStore('sessions');
          store.delete('auth-token');
          console.log('✅ Token cleared from IndexedDB');
        }
      };
    } catch (error) {
      console.warn('⚠️ IndexedDB clear failed:', error);
    }
  }
  
  // 5. Notify Flutter about logout
  if (typeof window !== 'undefined' && (window as unknown as { flutter_inappwebview?: unknown }).flutter_inappwebview) {
    try {
      (window as unknown as { flutter_inappwebview: { callHandler: (name: string, data: Record<string, unknown>) => void } }).flutter_inappwebview.callHandler('webViewMessage', {
        type: 'session_cleared',
        timestamp: new Date().toISOString()
      });
      console.log('✅ Logout notification sent to Flutter');
    } catch (error) {
      console.warn('⚠️ Failed to notify Flutter about logout:', error);
    }
  }
  
  console.log('✅ WebView session cleared from all storage methods');
};

/**
 * Enhanced WebView token retrieval with multiple fallbacks
 * Handles Flutter WebView specific session persistence
 */
export const getWebViewAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  console.log('🔍 Retrieving WebView auth token with multiple fallbacks...');
  
  // 1. Try localStorage first (primary)
  let token = localStorage.getItem('auth-token');
  if (token) {
    console.log('✅ Token found in localStorage');
    return token;
  }
  
  // 2. Try sessionStorage (WebView backup)
  token = sessionStorage.getItem('auth-token');
  if (token) {
    console.log('✅ Token found in sessionStorage, restoring to localStorage');
    localStorage.setItem('auth-token', token);
    return token;
  }
  
  // 3. Try standard cookies
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
  if (tokenCookie) {
    token = tokenCookie.split('=')[1];
    console.log('✅ Token found in standard cookie, restoring to localStorage');
    localStorage.setItem('auth-token', token);
    return token;
  }
  
  // 4. Try WebView-specific cookie
  const webViewCookie = cookies.find(cookie => cookie.trim().startsWith('webview-auth-token='));
  if (webViewCookie) {
    token = webViewCookie.split('=')[1];
    console.log('✅ Token found in WebView cookie, restoring to localStorage');
    localStorage.setItem('auth-token', token);
    return token;
  }
  
  // 5. Try IndexedDB (maximum persistence fallback)
  if ('indexedDB' in window) {
    try {
      const request = indexedDB.open('WebViewSession', 1);
      request.onsuccess = () => {
        const db = request.result;
        if (db.objectStoreNames.contains('sessions')) {
          const transaction = db.transaction(['sessions'], 'readonly');
          const store = transaction.objectStore('sessions');
          const getRequest = store.get('auth-token');
          getRequest.onsuccess = () => {
            if (getRequest.result) {
              console.log('✅ Token found in IndexedDB, restoring to localStorage');
              localStorage.setItem('auth-token', getRequest.result);
              // Note: This is async, so we can't return the token directly
              // The calling code will need to handle this case
            }
          };
        }
      };
    } catch (error) {
      console.warn('⚠️ IndexedDB retrieval failed:', error);
    }
  }
  
  // 6. Request token from Flutter (if available)
  if (typeof window !== 'undefined' && (window as unknown as { flutter_inappwebview?: unknown }).flutter_inappwebview) {
    try {
      (window as unknown as { flutter_inappwebview: { callHandler: (name: string, data: Record<string, unknown>) => void } }).flutter_inappwebview.callHandler('webViewMessage', {
        type: 'request_session',
        timestamp: new Date().toISOString()
      });
      console.log('📡 Requested session from Flutter');
    } catch (error) {
      console.warn('⚠️ Failed to request session from Flutter:', error);
    }
  }
  
  console.log('❌ No token found in any storage method');
  return null;
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

/**
 * Get auth token with WebView-aware fallback system
 * Automatically detects WebView and uses appropriate persistence method
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Check if we're in a WebView environment
  const isWebViewEnv = isWebView();
  
  if (isWebViewEnv) {
    console.log('🔧 WebView detected, using enhanced token retrieval');
    return getWebViewAuthToken();
  }
  
  // Standard browser token retrieval
  console.log('🌐 Standard browser detected, using standard token retrieval');
  
  // Try localStorage first
  let token = localStorage.getItem('auth-token');
  
  // If no token in localStorage, try to get from cookies
  if (!token) {
    console.log('🔍 No token in localStorage, checking cookies...');
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
      console.log('✅ Found token in cookies, restoring to localStorage');
      // Restore token to localStorage for consistency
      localStorage.setItem('auth-token', token);
    }
  }
  
  return token;
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
