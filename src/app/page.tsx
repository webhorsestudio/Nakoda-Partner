"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyJWTTokenClient, verifySimpleToken } from "@/utils/authUtils";
import { getUserRole } from "@/utils/roleUtils";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Check if user is authenticated
        const authToken = localStorage.getItem('auth-token');
        
        if (!authToken) {
          console.log('❌ No auth token found, redirecting to login');
          router.push('/login');
          return;
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
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
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
