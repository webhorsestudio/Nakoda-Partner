import { NextRequest } from 'next/server';
import { verifyJWTToken, TokenPayload, verifyJWTTokenClient, verifySimpleToken } from '@/utils/authUtils';

export interface AuthResult {
  success: boolean;
  userId?: number;
  error?: string;
}

export async function verifyPartnerToken(request: NextRequest): Promise<AuthResult> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('Auth debug:', {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    });
    
    if (!token) {
      // Try to get token from cookies
      const cookieToken = request.cookies.get('auth-token')?.value;
      
      console.log('Cookie token check:', {
        hasCookieToken: !!cookieToken,
        cookieValue: cookieToken ? `${cookieToken.substring(0, 50)}...` : 'none'
      });
      
      if (!cookieToken) {
        return { success: false, error: 'No token provided' };
      }
      
      // Try multiple verification methods
      let decoded = verifyJWTToken(cookieToken);
      if (!decoded) {
        decoded = verifyJWTTokenClient(cookieToken);
      }
      if (!decoded && !cookieToken.includes('.')) {
        // Only try simple token if it's not a JWT (no dots)
        decoded = verifySimpleToken(cookieToken);
      }
      
      if (!decoded) {
        return { success: false, error: 'Invalid token' };
      }
      
      if (decoded.role !== 'partner') {
        return { success: false, error: 'Invalid role' };
      }
      
      return { success: true, userId: decoded.userId };
    }
    
    // Try multiple verification methods
    let decoded = verifyJWTToken(token);
    if (!decoded) {
      decoded = verifyJWTTokenClient(token);
    }
    if (!decoded && !token.includes('.')) {
      // Only try simple token if it's not a JWT (no dots)
      decoded = verifySimpleToken(token);
    }
    
    if (!decoded) {
      return { success: false, error: 'Invalid token' };
    }
    
    if (decoded.role !== 'partner') {
      return { success: false, error: 'Invalid role' };
    }
    
    return { success: true, userId: decoded.userId };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

export async function verifyAdminToken(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      const cookieToken = request.cookies.get('auth-token')?.value;
      if (!cookieToken) {
        return { success: false, error: 'No token provided' };
      }
      
      // Try multiple verification methods
      let decoded = verifyJWTToken(cookieToken);
      if (!decoded) {
        decoded = verifyJWTTokenClient(cookieToken);
      }
      if (!decoded && !cookieToken.includes('.')) {
        // Only try simple token if it's not a JWT (no dots)
        decoded = verifySimpleToken(cookieToken);
      }
      
      if (!decoded) {
        return { success: false, error: 'Invalid token' };
      }
      
      if (decoded.role !== 'admin') {
        return { success: false, error: 'Invalid role' };
      }
      
      return { success: true, userId: decoded.userId };
    }
    
    // Try multiple verification methods
    let decoded = verifyJWTToken(token);
    if (!decoded) {
      decoded = verifyJWTTokenClient(token);
    }
    if (!decoded && !token.includes('.')) {
      // Only try simple token if it's not a JWT (no dots)
      decoded = verifySimpleToken(token);
    }
    
    if (!decoded) {
      return { success: false, error: 'Invalid token' };
    }
    
    if (decoded.role !== 'admin') {
      return { success: false, error: 'Invalid role' };
    }
    
    return { success: true, userId: decoded.userId };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}
