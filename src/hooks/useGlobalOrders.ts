// React 19 + Next.js 15+ optimized hook using global order manager
import { useState, useEffect, useCallback, useRef } from 'react';
import { globalOrderManager, type OrderState, type Task } from '@/lib/globalOrderManager';

interface UseGlobalOrdersReturn {
  orders: Task[];
  isLoading: boolean;
  error: string | null;
  total: number;
  partner: {
    id: number;
    name: string;
    city: string;
    serviceType: string;
  } | null;
  refreshOrders: () => void;
  acceptOrder: (orderId: string) => Promise<boolean>;
  isAccepting: boolean;
  hasNewOrders: boolean;
  newOrdersCount: number;
  dismissNewOrdersNotification: () => void;
  cleanupOldOrders: () => Promise<void>;
}

export function useGlobalOrders(refreshInterval: number = 30000): UseGlobalOrdersReturn {
  const [state, setState] = useState<OrderState>(() => globalOrderManager.getState());
  const [isAccepting, setIsAccepting] = useState(false);
  const isMountedRef = useRef(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastStateRef = useRef<OrderState>(globalOrderManager.getState());
  const isInitializedRef = useRef(false);

  // Subscribe to global state changes
  useEffect(() => {
    console.log('🚀 useGlobalOrders: Hook mounted');
    isMountedRef.current = true;

    // Initialize global manager only once
    if (!isInitializedRef.current) {
      globalOrderManager.initialize(refreshInterval);
      isInitializedRef.current = true;
    }

    // Subscribe to state changes only if not already subscribed
    if (!unsubscribeRef.current) {
      unsubscribeRef.current = globalOrderManager.subscribe((newState) => {
        if (isMountedRef.current) {
          // Only update if state actually changed
          const hasChanged = 
            lastStateRef.current.isLoading !== newState.isLoading ||
            lastStateRef.current.error !== newState.error ||
            lastStateRef.current.orders.length !== newState.orders.length ||
            lastStateRef.current.total !== newState.total ||
            lastStateRef.current.partner?.id !== newState.partner?.id ||
            lastStateRef.current.hasNewOrders !== newState.hasNewOrders ||
            lastStateRef.current.newOrdersCount !== newState.newOrdersCount ||
            JSON.stringify(lastStateRef.current.orders) !== JSON.stringify(newState.orders);
          
          if (hasChanged) {
            console.log('📡 useGlobalOrders: State changed, updating component');
            lastStateRef.current = newState;
            setState(newState);
          } else {
            console.log('⏭️ useGlobalOrders: State unchanged, skipping update');
          }
        }
      });
    }

    return () => {
      console.log('💀 useGlobalOrders: Hook unmounting');
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []); // Remove refreshInterval dependency to prevent remounting

  // Refresh orders
  const refreshOrders = useCallback(() => {
    console.log('🔄 useGlobalOrders: Manual refresh triggered');
    globalOrderManager.refresh();
  }, []);

  // Accept order
  const acceptOrder = useCallback(async (orderId: string): Promise<boolean> => {
    console.log('✅ useGlobalOrders: Accepting order:', orderId);
    setIsAccepting(true);
    
    try {
      const success = await globalOrderManager.acceptOrder(orderId);
      return success;
    } finally {
      setIsAccepting(false);
    }
  }, []);

  // Dismiss new orders notification
  const dismissNewOrdersNotification = useCallback(() => {
    console.log('❌ useGlobalOrders: Dismissing new orders notification');
    globalOrderManager.dismissNewOrdersNotification();
  }, []);

  // Cleanup old orders
  const cleanupOldOrders = useCallback(async (): Promise<void> => {
    console.log('🧹 useGlobalOrders: Cleaning up old orders');
    await globalOrderManager.cleanupOldOrders();
  }, []);

  return {
    orders: state.orders,
    isLoading: state.isLoading,
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
