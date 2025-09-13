"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlobalOrderProvider } from "@/contexts/GlobalOrderProvider";

interface PartnerLayoutProps {
  children: React.ReactNode;
}

export default function PartnerLayout({ children }: PartnerLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Simple token existence check - let usePartnerAuth handle detailed validation
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Partner auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <GlobalOrderProvider>
      {children}
    </GlobalOrderProvider>
  );
}
