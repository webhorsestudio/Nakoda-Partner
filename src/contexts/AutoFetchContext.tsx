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
