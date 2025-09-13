"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { getBackgroundAutoFetchService } from '@/services/backgroundAutoFetchService';
import { requestNotificationPermission } from '@/utils/backgroundService';

interface AutoFetchContextType {
  countdown: number;
  isFetching: boolean;
  lastFetchTime: Date | null;
  totalOrders: number;
  isAutoFetchEnabled: boolean;
  triggerManualFetch: () => Promise<void>;
  toggleAutoFetch: () => void;
  requestNotifications: () => Promise<boolean>;
}

const AutoFetchContext = createContext<AutoFetchContextType | undefined>(undefined);

interface AutoFetchProviderProps {
  children: ReactNode;
}

export function AutoFetchProvider({ children }: AutoFetchProviderProps) {
  const [countdown, setCountdown] = useState(300); // 5 minutes (300 seconds)
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const totalOrders = 0; // Static value since it's never updated
  
  // Get auto-fetch state from background service
  const [isAutoFetchEnabled, setIsAutoFetchEnabled] = useState(false);

  // Initialize background services and sync state
  useEffect(() => {
    const initBackgroundServices = async () => {
      try {
        // Check if user is admin before initializing
        const token = localStorage.getItem('auth-token');
        if (token) {
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const base64Url = parts[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
              const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              const decoded = JSON.parse(jsonPayload);
              
              if (decoded.role !== 'admin') {
                console.log('🌍 AutoFetchProvider: Non-admin user, skipping background services');
                return;
              }
            }
          } catch (error) {
            console.log('🌍 AutoFetchProvider: Token decode failed, skipping background services');
            return;
          }
        } else {
          console.log('🌍 AutoFetchProvider: No token found, skipping background services');
          return;
        }

        // Get the background service instance (it auto-initializes)
        const backgroundService = getBackgroundAutoFetchService();
        
        // Get initial status
        const status = backgroundService.getStatus();
        setIsAutoFetchEnabled(status.isEnabled);
        setCountdown(status.countdown);
        setLastFetchTime(status.lastFetchTime);
        setIsFetching(status.isFetching);
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      } catch (error) {
        console.error('Failed to initialize background services:', error);
      }
    };

    initBackgroundServices();
  }, []);

  // Sync countdown from background service
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user is admin before setting up countdown sync
      const token = localStorage.getItem('auth-token');
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
            const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            
            if (decoded.role !== 'admin') {
              return; // Skip countdown sync for non-admin users
            }
          }
        } catch (error) {
          return; // Skip countdown sync if token decode fails
        }
      } else {
        return; // Skip countdown sync if no token
      }

      const updateCountdown = () => {
        const savedCountdown = localStorage.getItem('backgroundAutoFetchCountdown');
        if (savedCountdown) {
          setCountdown(parseInt(savedCountdown, 10));
        }
      };

      // Update immediately
      updateCountdown();

      // Set up interval to sync countdown
      const interval = setInterval(updateCountdown, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  // Sync fetching state from background service
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user is admin before setting up fetching state sync
      const token = localStorage.getItem('auth-token');
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
            const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            
            if (decoded.role !== 'admin') {
              return; // Skip fetching state sync for non-admin users
            }
          }
        } catch (error) {
          return; // Skip fetching state sync if token decode fails
        }
      } else {
        return; // Skip fetching state sync if no token
      }

      const updateFetchingState = () => {
        const backgroundService = getBackgroundAutoFetchService();
        const status = backgroundService.getStatus();
        setIsFetching(status.isFetching);
        setLastFetchTime(status.lastFetchTime);
      };

      // Update immediately
      updateFetchingState();

      // Set up interval to sync fetching state
      const interval = setInterval(updateFetchingState, 2000);

      return () => clearInterval(interval);
    }
  }, []);

  const triggerManualFetch = useCallback(async () => {
    if (typeof window !== 'undefined') {
      // Check if user is admin before triggering manual fetch
      const token = localStorage.getItem('auth-token');
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
            const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            
            if (decoded.role !== 'admin') {
              console.log('🌍 AutoFetchProvider: Non-admin user, skipping manual fetch');
              return;
            }
          }
        } catch (error) {
          console.log('🌍 AutoFetchProvider: Token decode failed, skipping manual fetch');
          return;
        }
      } else {
        console.log('🌍 AutoFetchProvider: No token found, skipping manual fetch');
        return;
      }

      const backgroundService = getBackgroundAutoFetchService();
      await backgroundService.triggerManualFetch();
      
      // Update local state
      const status = backgroundService.getStatus();
      setCountdown(status.countdown);
      setLastFetchTime(status.lastFetchTime);
    }
  }, []);

  const toggleAutoFetch = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Check if user is admin before toggling auto-fetch
      const token = localStorage.getItem('auth-token');
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
            const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            
            if (decoded.role !== 'admin') {
              console.log('🌍 AutoFetchProvider: Non-admin user, skipping auto-fetch toggle');
              return;
            }
          }
        } catch (error) {
          console.log('🌍 AutoFetchProvider: Token decode failed, skipping auto-fetch toggle');
          return;
        }
      } else {
        console.log('🌍 AutoFetchProvider: No token found, skipping auto-fetch toggle');
        return;
      }

      const backgroundService = getBackgroundAutoFetchService();
      const newState = backgroundService.toggle();
      
      setIsAutoFetchEnabled(newState);
      
      if (newState) {
        setCountdown(300); // Reset countdown when enabling to 5 minutes
        toast.success('Auto-fetch enabled - Orders will sync every 5 minutes');
      } else {
        toast('Auto-fetch disabled - Manual sync only', { icon: 'ℹ️' });
      }
    }
  }, []);

  const requestNotifications = useCallback(async (): Promise<boolean> => {
    return await requestNotificationPermission();
  }, []);

  const value: AutoFetchContextType = {
    countdown,
    isFetching,
    lastFetchTime,
    totalOrders,
    isAutoFetchEnabled,
    triggerManualFetch,
    toggleAutoFetch,
    requestNotifications,
  };

  return (
    <AutoFetchContext.Provider value={value}>
      {children}
    </AutoFetchContext.Provider>
  );
}

export function useAutoFetch() {
  const context = useContext(AutoFetchContext);
  if (context === undefined) {
    throw new Error('useAutoFetch must be used within an AutoFetchProvider');
  }
  return context;
}
