'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { globalOrderService } from '@/lib/globalOrderService';

const GlobalOrderContext = createContext<{
  isServiceRunning: boolean;
  refreshOrders: () => void;
}>({
  isServiceRunning: false,
  refreshOrders: () => {},
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
            const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            
            if (decoded.role === 'partner') {
              console.log('🌍 Global Order Provider: Partner user authenticated, initializing service...');
              globalOrderService.initialize(10000);
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
    checkAuthAndInitialize();
    
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
              const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              const decoded = JSON.parse(jsonPayload);
              
              if (decoded.role === 'partner') {
                console.log('🌍 Global Order Provider: Partner auth token added, initializing service...');
                globalOrderService.initialize(10000);
              } else {
                console.log('🌍 Global Order Provider: Non-partner auth token added, skipping initialization');
              }
            }
          } catch (error) {
            console.log('🌍 Global Order Provider: New token decode failed, skipping initialization');
          }
        } else {
          console.log('🌍 Global Order Provider: Auth token removed, stopping service...');
          globalOrderService.stop();
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      console.log('🌍 Global Order Provider: Cleaning up...');
      window.removeEventListener('storage', handleStorageChange);
      // Stop the service when component unmounts
      globalOrderService.stop();
    };
  }, []);

  const refreshOrders = () => {
    globalOrderService.refresh();
  };

  return (
    <GlobalOrderContext.Provider value={{ 
      isServiceRunning: true, 
      refreshOrders 
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
