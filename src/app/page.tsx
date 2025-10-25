"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyJWTTokenClient, verifySimpleToken, clearWebViewSession, getAuthToken } from "@/utils/authUtils";
import { initializeFlutterSessionBackup, requestSessionFromFlutter, initializeWebViewSessionRecovery } from "@/utils/webViewUtils";
import { getUserRole } from "@/utils/roleUtils";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Initialize both Flutter session backup and recovery systems
        initializeFlutterSessionBackup();
        initializeWebViewSessionRecovery();
        
        // Check if user is authenticated - try localStorage first, then cookies
        let authToken = getAuthToken();
        
        if (!authToken) {
          console.log('❌ No auth token found in localStorage or cookies');
          
          // If we're in Flutter WebView, request session from Flutter
          if (typeof window !== 'undefined' && (window as unknown as { flutter_inappwebview?: unknown }).flutter_inappwebview) {
            console.log('🔧 Flutter WebView detected, requesting session from Flutter...');
            
            try {
              const flutterToken = await requestSessionFromFlutter();
              if (flutterToken) {
                console.log('✅ Session received from Flutter, restoring...');
                
                // Store the token in all locations
                localStorage.setItem('auth-token', flutterToken);
                sessionStorage.setItem('auth-token', flutterToken);
                
                // Set cookies with proper domain handling
                const cookieExpiry = 7 * 24 * 60 * 60;
                const isSecure = window.location.protocol === 'https:';
                const domain = window.location.hostname;
                
                document.cookie = `auth-token=${flutterToken}; path=/; max-age=${cookieExpiry}; SameSite=Lax; ${isSecure ? 'Secure' : ''}`;
                document.cookie = `webview-auth-token=${flutterToken}; path=/; max-age=${cookieExpiry}; SameSite=None; ${isSecure ? 'Secure' : ''}`;
                
                if (domain.includes('nakodadcs.com')) {
                  document.cookie = `auth-token=${flutterToken}; path=/; max-age=${cookieExpiry}; SameSite=Lax; ${isSecure ? 'Secure' : ''}; domain=.nakodadcs.com`;
                }
                
                console.log('✅ Session restored from Flutter');
                
                // Continue with token verification
                authToken = flutterToken;
              } else {
                console.log('❌ No session found in Flutter, redirecting to login');
                router.push('/login');
                return;
              }
            } catch (error) {
              console.error('❌ Error requesting session from Flutter:', error);
              router.push('/login');
              return;
            }
          } else {
            console.log('❌ Not in WebView, redirecting to login');
            router.push('/login');
            return;
          }
        }

        // Verify token - try JWT first, then simple token
        let decoded = verifyJWTTokenClient(authToken);
        if (!decoded) {
          // Only try simple token if it's not a JWT (no dots)
          if (!authToken.includes('.')) {
            decoded = verifySimpleToken(authToken);
          }
        }

        if (!decoded) {
          console.log('❌ Invalid token, redirecting to login');
          localStorage.removeItem('auth-token');
          clearWebViewSession();
          router.push('/login');
          return;
        }

        // Get user role based on mobile number
        const mobile = decoded.mobile || decoded.phone;
        if (!mobile) {
          console.log('❌ No mobile/phone found in token, redirecting to login');
          router.push('/login');
          return;
        }

        const userRole = await getUserRole(mobile);
        if (!userRole) {
          console.log('❌ Failed to get user role, redirecting to login');
          router.push('/login');
          return;
        }

        // Redirect based on role
        console.log('🔑 User role determined:', userRole.role);
        if (userRole.role === 'admin') {
          console.log('✅ Redirecting admin to /admin');
          router.push('/admin');
        } else if (userRole.role === 'partner') {
          console.log('✅ Redirecting partner to /partner');
          router.push('/partner');
        } else {
          console.log('❌ Unknown role, redirecting to login');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {isLoading ? 'Checking authentication...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
