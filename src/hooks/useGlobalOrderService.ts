'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { globalOrderService } from '@/lib/globalOrderService';
import { Task, PartnerInfo } from '@/lib/globalOrderManager';

interface UseGlobalOrderServiceReturn {
  orders: Task[];
  isLoading: boolean;
  error: string | null;
  total: number;
  partner: PartnerInfo | null;
  refreshOrders: () => void;
  acceptOrder: (orderId: string) => Promise<void>;
  isAccepting: boolean;
  hasNewOrders: boolean;
  newOrdersCount: number;
  dismissNewOrdersNotification: () => void;
  cleanupOldOrders: () => Promise<void>;
}

export function useGlobalOrderService(): UseGlobalOrderServiceReturn {
  const [state, setState] = useState(() => globalOrderService.getState());
  const [isAccepting, setIsAccepting] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const isMountedRef = useRef(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastStateRef = useRef(globalOrderService.getState());

  // Subscribe to global state changes
  useEffect(() => {
    console.log('🚀 useGlobalOrderService: Hook mounted');
    isMountedRef.current = true;

    // Subscribe to state changes only if not already subscribed
    if (!unsubscribeRef.current) {
      unsubscribeRef.current = globalOrderService.subscribe((newState) => {
        if (isMountedRef.current) {
          // Only update if meaningful data changed
          const hasChanged = 
            lastStateRef.current.error !== newState.error ||
            lastStateRef.current.orders.length !== newState.orders.length ||
            lastStateRef.current.total !== newState.total ||
            lastStateRef.current.partner?.id !== newState.partner?.id ||
            lastStateRef.current.hasNewOrders !== newState.hasNewOrders ||
            lastStateRef.current.newOrdersCount !== newState.newOrdersCount ||
            JSON.stringify(lastStateRef.current.orders) !== JSON.stringify(newState.orders);
          
          if (hasChanged) {
            console.log('📡 useGlobalOrderService: State changed, updating component');
            lastStateRef.current = newState;
            setState(newState);
          } else {
            console.log('⏭️ useGlobalOrderService: State unchanged, skipping update');
          }
        }
      });
    }

    return () => {
      console.log('💀 useGlobalOrderService: Hook unmounting');
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []); // No dependencies to prevent remounting

  // Refresh orders
  const refreshOrders = useCallback(async () => {
    console.log('🔄 useGlobalOrderService: Manual refresh triggered');
    setIsManualRefreshing(true);
    try {
      await globalOrderService.refresh();
    } finally {
      // Reset manual refreshing state after a short delay to show animation
      setTimeout(() => {
        setIsManualRefreshing(false);
      }, 1000);
    }
  }, []);

  // Accept order
  const acceptOrder = useCallback(async (orderId: string) => {
    if (isAccepting) return;
    
    setIsAccepting(true);
    try {
      await globalOrderService.acceptOrder(orderId);
      console.log('✅ useGlobalOrderService: Order accepted successfully');
    } catch (error) {
      console.error('❌ useGlobalOrderService: Failed to accept order:', error);
    } finally {
      setIsAccepting(false);
    }
  }, [isAccepting]);

  // Dismiss new orders notification
  const dismissNewOrdersNotification = useCallback(() => {
    globalOrderService.dismissNewOrdersNotification();
  }, []);

  // Cleanup old orders
  const cleanupOldOrders = useCallback(async () => {
    try {
      await globalOrderService.cleanupOldOrders();
      console.log('✅ useGlobalOrderService: Old orders cleaned up');
    } catch (error) {
      console.error('❌ useGlobalOrderService: Failed to cleanup old orders:', error);
    }
  }, []);

  return {
    orders: state.orders,
    isLoading: state.isLoading || isManualRefreshing,
    error: state.error,
    total: state.total,
    partner: state.partner,
    refreshOrders,
    acceptOrder,
    isAccepting,
    hasNewOrders: state.hasNewOrders,
    newOrdersCount: state.newOrdersCount,
    dismissNewOrdersNotification,
    cleanupOldOrders,
  };
}
