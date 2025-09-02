import { NextRequest } from 'next/server';
import { verifyJWTToken, TokenPayload } from '@/utils/authUtils';

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
    
    if (!token) {
      // Try to get token from cookies
      const cookieToken = request.cookies.get('auth-token')?.value;
      if (!cookieToken) {
        return { success: false, error: 'No token provided' };
      }
      
      const decoded = verifyJWTToken(cookieToken);
      if (!decoded) {
        return { success: false, error: 'Invalid token' };
      }
      
      if (decoded.role !== 'partner') {
        return { success: false, error: 'Invalid role' };
      }
      
      return { success: true, userId: decoded.userId };
    }
    
    const decoded = verifyJWTToken(token);
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
      
      const decoded = verifyJWTToken(cookieToken);
      if (!decoded) {
        return { success: false, error: 'Invalid token' };
      }
      
      if (decoded.role !== 'admin') {
        return { success: false, error: 'Invalid role' };
      }
      
      return { success: true, userId: decoded.userId };
    }
    
    const decoded = verifyJWTToken(token);
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
