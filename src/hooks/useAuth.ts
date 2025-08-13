import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    if (isClient) {
      const authToken = document.cookie.includes('auth-token');
      if (authToken) {
        router.push('/admin');
      }
    }
  }, [isClient, router]);

  const handleLogout = () => {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  return {
    isClient,
    handleLogout
  };
}
