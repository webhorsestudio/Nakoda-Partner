import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Define the structure of decoded token data
interface DecodedToken {
  role?: string;
  mobile?: string;
  phone?: string;
  name?: string;
  email?: string;
  [key: string]: unknown; // Allow for additional properties
}

// Define the structure of partner information
export interface PartnerInfo {
  id?: number;
  name?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  role?: string;
  status?: string;
  service_type?: string;
  location?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  address?: string;
  total_revenue?: number;
  total_orders?: number;
  rating?: number;
  commission_percentage?: number;
  verification_status?: string;
  documents_verified?: boolean;
  joined_date?: string;
  last_active?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown; // Allow for additional properties
}

export function usePartnerAuth() {
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const router = useRouter();

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth-token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Decode token to get partner info
      let decoded: DecodedToken;
      try {
        // Validate token format first
        if (!token || typeof token !== 'string' || token.trim() === '') {
          throw new Error('Invalid token format');
        }

        // Try to decode as JWT first
        const parts = token.split('.');
        console.log('Token parts:', parts.length, 'First part:', parts[0]?.substring(0, 20) + '...');
        
        if (parts.length === 3) {
          // JWT format - use manual decode for client-side (jsonwebtoken doesn't work in browser)
          console.log('🔍 JWT token detected, using manual decode for client-side');
          const base64Url = parts[1];
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
            const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            decoded = JSON.parse(jsonPayload);
            console.log('✅ Manual JWT decode successful');
          } else {
            throw new Error('Invalid JWT format');
          }
        } else {
          // Fallback to simple token
          console.log('Token is not JWT format, trying simple token decode');
          const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
          if (!base64Regex.test(token)) {
            throw new Error('Invalid token encoding');
          }
          decoded = JSON.parse(decodeURIComponent(atob(token)));
        }
      } catch (decodeError) {
        console.error('Token decode failed:', decodeError);
        setError('Invalid authentication token');
        // Clear invalid token
        localStorage.removeItem('auth-token');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      console.log('🔍 Decoded token:', decoded);
      console.log('🔍 Token role:', decoded.role);

      if (decoded.role !== 'partner') {
        console.log('❌ User is not a partner, role:', decoded.role);
        console.log('🔄 Redirecting to admin...');
        router.push('/admin');
        return;
      }
      
      console.log('✅ User is a partner, continuing...');

      // Extract mobile number from token
      const mobile = decoded.mobile || decoded.phone;
      if (!mobile) {
        setError('Mobile number not found in token');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      // Fetch real partner data from database
      try {
        console.log(`🔍 Fetching partner data for mobile: ${mobile}`);
        const response = await fetch(`/api/partners/by-mobile?mobile=${encodeURIComponent(mobile)}`);
        const result = await response.json();

        console.log(`📡 API response status: ${response.status}`);
        console.log(`📡 API response:`, result);

        if (result.success && result.data) {
          // Merge token data with database data
          const fullPartnerInfo = {
            ...decoded,
            ...result.data,
            mobile: mobile // Ensure mobile is set
          };
          console.log(`✅ Partner info merged successfully:`, fullPartnerInfo);
          setPartnerInfo(fullPartnerInfo);
        } else {
          console.error('❌ Failed to fetch partner data:', result.error);
          // Don't redirect immediately, show error but allow user to stay
          console.log('⚠️ API failed, but allowing user to stay with token data');
          setPartnerInfo(decoded);
          setError(`Warning: ${result.error} - Using cached data`);
        }
      } catch (fetchError) {
        console.error('❌ Error fetching partner data:', fetchError);
        // Fallback to token data only - don't redirect
        console.log('⚠️ Falling back to token data only');
        setPartnerInfo(decoded);
        setError('Warning: Unable to fetch latest data - using cached information');
      }

    } catch (error) {
      console.error('Auth check failed:', error);
      setError('Authentication failed');
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isClient) {
      checkAuth();
    }
  }, [isClient]); // Remove checkAuth from dependencies to prevent infinite loop

  const logout = useCallback(() => {
    localStorage.removeItem('auth-token');
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    setPartnerInfo(null);
    router.push('/login');
  }, [router]);

  const retryAuth = useCallback(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isClient,
    partnerInfo,
    error,
    isLoading,
    logout,
    retryAuth
  };
}
