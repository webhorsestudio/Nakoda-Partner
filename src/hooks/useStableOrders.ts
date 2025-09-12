import { useState, useEffect, useRef, useCallback } from 'react';
import { globalOrderManager, OrderState, Task, PartnerInfo } from '@/lib/globalOrderManager';

interface UseStableOrdersReturn {
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

export function useStableOrders(refreshInterval: number = 30000): UseStableOrdersReturn {
  const [state, setState] = useState<OrderState>(() => globalOrderManager.getState());
  const [isAccepting, setIsAccepting] = useState(false);
  const isMountedRef = useRef(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastStateRef = useRef<OrderState>(globalOrderManager.getState());
  const isInitializedRef = useRef(false);
  const renderCountRef = useRef(0);

  // Subscribe to global state changes
  useEffect(() => {
    console.log('🚀 useStableOrders: Hook mounted');
    isMountedRef.current = true;
    renderCountRef.current += 1;

    // Initialize global manager only once
    if (!isInitializedRef.current) {
      globalOrderManager.initialize(refreshInterval);
      isInitializedRef.current = true;
    }

    // Subscribe to state changes only if not already subscribed
    if (!unsubscribeRef.current) {
      unsubscribeRef.current = globalOrderManager.subscribe((newState) => {
        if (isMountedRef.current) {
          // Only update if meaningful data changed (ignore loading state changes when data is identical)
          const hasChanged = 
            lastStateRef.current.error !== newState.error ||
            lastStateRef.current.orders.length !== newState.orders.length ||
            lastStateRef.current.total !== newState.total ||
            lastStateRef.current.partner?.id !== newState.partner?.id ||
            lastStateRef.current.hasNewOrders !== newState.hasNewOrders ||
            lastStateRef.current.newOrdersCount !== newState.newOrdersCount ||
            JSON.stringify(lastStateRef.current.orders) !== JSON.stringify(newState.orders);
          
          if (hasChanged) {
            console.log(`📡 useStableOrders: State changed, updating component (render ${renderCountRef.current})`);
            lastStateRef.current = newState;
            setState(newState);
          } else {
            console.log(`⏭️ useStableOrders: State unchanged, skipping update (render ${renderCountRef.current})`);
          }
        }
      });
    }

    return () => {
      console.log('💀 useStableOrders: Hook unmounting');
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []); // No dependencies to prevent remounting

  // Refresh orders
  const refreshOrders = useCallback(() => {
    console.log('🔄 useStableOrders: Manual refresh triggered');
    globalOrderManager.refresh();
  }, []);

  // Accept order
  const acceptOrder = useCallback(async (orderId: string) => {
    if (isAccepting) return;
    
    setIsAccepting(true);
    try {
      await globalOrderManager.acceptOrder(orderId);
      console.log('✅ useStableOrders: Order accepted successfully');
    } catch (error) {
      console.error('❌ useStableOrders: Failed to accept order:', error);
    } finally {
      setIsAccepting(false);
    }
  }, [isAccepting]);

  // Dismiss new orders notification
  const dismissNewOrdersNotification = useCallback(() => {
    globalOrderManager.dismissNewOrdersNotification();
  }, []);

  // Cleanup old orders
  const cleanupOldOrders = useCallback(async () => {
    try {
      await globalOrderManager.cleanupOldOrders();
      console.log('✅ useStableOrders: Old orders cleaned up');
    } catch (error) {
      console.error('❌ useStableOrders: Failed to cleanup old orders:', error);
    }
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
