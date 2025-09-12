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
    
    // Check if user is authenticated before initializing
    const checkAuthAndInitialize = () => {
      const token = localStorage.getItem('auth-token');
      if (token) {
        console.log('🌍 Global Order Provider: User authenticated, initializing service...');
        globalOrderService.initialize(10000);
      } else {
        console.log('🌍 Global Order Provider: User not authenticated, skipping initialization');
      }
    };
    
    // Initialize immediately if token exists
    checkAuthAndInitialize();
    
    // Also listen for auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-token') {
        if (e.newValue) {
          console.log('🌍 Global Order Provider: Auth token added, initializing service...');
          globalOrderService.initialize(10000);
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
      // Don't stop the service here as it should run globally
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
