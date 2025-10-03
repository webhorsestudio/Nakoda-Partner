'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { globalOrderService } from '@/lib/globalOrderService';
import { globalOrderFetcher } from '@/services/globalOrderFetcher';

const GlobalOrderContext = createContext<{
  isServiceRunning: boolean;
  refreshOrders: () => void;
  globalFetcherStatus: {
    isRunning: boolean;
    lastSync: Date | null;
    retryCount: number;
  };
}>({
  isServiceRunning: false,
  refreshOrders: () => {},
  globalFetcherStatus: {
    isRunning: false,
    lastSync: null,
    retryCount: 0
  },
});

interface GlobalOrderProviderProps {
  children: ReactNode;
}

export function GlobalOrderProvider({ children }: GlobalOrderProviderProps) {
  useEffect(() => {
    console.log('🌍 Global Order Provider: Initializing global order service...');
    
    // Check if user is authenticated and is a partner before initializing
    const checkAuthAndInitialize = () => {
      const token = localStorage.getItem('auth-token');
      if (token) {
        try {
          // Decode token to check if user is a partner
          const parts = token.split('.');
          if (parts.length === 3) {
            // JWT format - decode payload
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            
            if (decoded.role === 'partner' || decoded.role === 'admin' || decoded.role === 'Admin' || decoded.role === 'Super Admin' || decoded.role === 'Support Admin' || decoded.role === 'Analytics Admin' || decoded.role === 'Technical Admin') {
              console.log('🌍 Global Order Provider: User authenticated, initializing service...', decoded.role);
              
              // Initialize partner order service (for both admin and partner)
              globalOrderService.initialize(10000);
              
              // Start global fetcher for continuous updates
              globalOrderFetcher.start().catch(console.error);
              
              // Listen for global order updates
              const handleGlobalOrdersUpdated = (event: CustomEvent) => {
                console.log('🔄 Partner: Received global order update', event.detail);
                // Refresh partner orders when global orders are updated
                globalOrderService.refresh();
              };
              
              window.addEventListener('globalOrdersUpdated', handleGlobalOrdersUpdated as EventListener);
              
              // Cleanup function
              return () => {
                window.removeEventListener('globalOrdersUpdated', handleGlobalOrdersUpdated as EventListener);
              };
            } else {
              console.log('🌍 Global Order Provider: Non-partner user, skipping initialization');
            }
          } else {
            console.log('🌍 Global Order Provider: Non-JWT token, skipping initialization');
          }
        } catch (error) {
          console.log('🌍 Global Order Provider: Token decode failed, skipping initialization');
        }
      } else {
        console.log('🌍 Global Order Provider: User not authenticated, skipping initialization');
      }
    };
    
    // Initialize immediately if token exists and user is partner
    const cleanup = checkAuthAndInitialize();
    
    // Also listen for auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-token') {
        if (e.newValue) {
          // Check if new token is for a partner
          try {
            const parts = e.newValue.split('.');
            if (parts.length === 3) {
              const base64Url = parts[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              const decoded = JSON.parse(jsonPayload);
              
              if (decoded.role === 'partner' || decoded.role === 'admin' || decoded.role === 'Admin' || decoded.role === 'Super Admin' || decoded.role === 'Support Admin' || decoded.role === 'Analytics Admin' || decoded.role === 'Technical Admin') {
                console.log('🌍 Global Order Provider: Auth token added, initializing service...', decoded.role);
                globalOrderService.initialize(10000);
                globalOrderFetcher.start().catch(console.error);
              } else {
                console.log('🌍 Global Order Provider: Non-admin/partner auth token added, skipping initialization');
              }
            }
          } catch (error) {
            console.log('🌍 Global Order Provider: New token decode failed, skipping initialization');
          }
        } else {
          console.log('🌍 Global Order Provider: Auth token removed, stopping service...');
          globalOrderService.stop();
          globalOrderFetcher.stop().catch(console.error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      console.log('🌍 Global Order Provider: Cleaning up...');
      window.removeEventListener('storage', handleStorageChange);
      if (cleanup) cleanup();
      // Stop the services when component unmounts
      globalOrderService.stop();
      globalOrderFetcher.stop().catch(console.error);
    };
  }, []);

  const refreshOrders = () => {
    globalOrderService.refresh();
  };

  // Get global fetcher status
  const globalFetcherStatus = globalOrderFetcher.getStatus();

  return (
    <GlobalOrderContext.Provider value={{ 
      isServiceRunning: true, 
      refreshOrders,
      globalFetcherStatus
    }}>
      {children}
    </GlobalOrderContext.Provider>
  );
}

export function useGlobalOrderContext() {
  const context = useContext(GlobalOrderContext);
  if (context === undefined) {
    throw new Error('useGlobalOrderContext must be used within a GlobalOrderProvider');
  }
  return context;
}