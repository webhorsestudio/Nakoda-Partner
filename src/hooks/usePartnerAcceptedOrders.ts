'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePartnerAuth } from './usePartnerAuth';

interface PartnerAcceptedOrder {
  id: string;
  title: string;
  customerName: string;
  location: string;
  amount: number;
  duration: string;
  serviceType: string;
  orderNumber: string;
  orderDate: string;
  serviceDate: string;
  serviceTime: string;
  status: 'in-progress' | 'completed' | 'cancelled' | 'assigned';
  startTime?: string;
  estimatedEndTime?: string;
  actualStartTime?: string;
  currentPhase: string;
  notes?: string;
  photos?: string[];
  customerPhone: string;
  customerAddress: string;
  advanceAmount: number;
  balanceAmount: number;
  commissionAmount: number;
  mode?: string | null;
}

interface UsePartnerAcceptedOrdersReturn {
  orders: PartnerAcceptedOrder[];
  isLoading: boolean;
  error: string | null;
  total: number;
  refreshOrders: () => void;
  hasNewOrders: boolean;
  newOrdersCount: number;
  dismissNewOrdersNotification: () => void;
}

export function usePartnerAcceptedOrders(): UsePartnerAcceptedOrdersReturn {
  const { partnerInfo } = usePartnerAuth();
  const [orders, setOrders] = useState<PartnerAcceptedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const isMountedRef = useRef(true);
  const previousOrdersCountRef = useRef(0);

  // Fetch partner's accepted orders from API
  const fetchAcceptedOrders = useCallback(async (forceRefresh = false) => {
    if (isLoading || !partnerInfo?.id) return; // Prevent concurrent fetches

    console.log('🔄 Partner: Fetching accepted orders...');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/partners/orders/accepted', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Unauthorized, redirecting to login');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Partner: API Response received:', result);

      if (result.success) {
        const newOrders = result.orders || [];
        const newOrdersCount = result.total || 0;
        
        // Always update state for now - remove complex change detection that causes loops
        const hasNew = newOrdersCount > previousOrdersCountRef.current && previousOrdersCountRef.current > 0;
        
        setOrders(newOrders);
        setTotal(newOrdersCount);
        setHasNewOrders(hasNew);
        setNewOrdersCount(hasNew ? newOrdersCount - previousOrdersCountRef.current : 0);
        console.log('✅ Partner: State updated successfully');

        previousOrdersCountRef.current = newOrdersCount;
      } else {
        throw new Error(result.error || 'Failed to fetch accepted orders');
      }
    } catch (error) {
      console.error('❌ Partner: Fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch accepted orders');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, partnerInfo?.id]); // Removed orders and total from dependencies

  // Manual refresh
  const refreshOrders = useCallback(async () => {
    console.log('🔄 Partner: Manual refresh triggered');
    setIsManualRefreshing(true);
    try {
      await fetchAcceptedOrders(true); // Force refresh for manual refresh
    } finally {
      // Reset manual refreshing state after a short delay to show animation
      setTimeout(() => {
        setIsManualRefreshing(false);
      }, 1000);
    }
  }, [fetchAcceptedOrders]);

  // Dismiss new orders notification
  const dismissNewOrdersNotification = useCallback(() => {
    setHasNewOrders(false);
    setNewOrdersCount(0);
  }, []);

  // Initial fetch and setup
  useEffect(() => {
    if (!partnerInfo?.id) return;
    
    isMountedRef.current = true;
    fetchAcceptedOrders();

    // Removed auto-refresh timer - no more automatic refreshing
    // Removed visibility change listener - no more tab-switch refreshing

    return () => {
      isMountedRef.current = false;
    };
  }, [partnerInfo?.id]); // Remove fetchAcceptedOrders from dependencies

  return {
    orders,
    isLoading: isLoading || isManualRefreshing,
    error,
    total,
    refreshOrders,
    hasNewOrders,
    newOrdersCount,
    dismissNewOrdersNotification,
  };
}
