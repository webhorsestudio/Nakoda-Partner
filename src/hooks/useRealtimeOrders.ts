import { useState, useEffect, useCallback, useRef } from 'react';

export interface RealtimeOrder {
  id: string;
  title: string;
  customerName: string;
  location: string;
  amount: number;
  duration: string;
  serviceType: string;
  priority: string;
  isExclusive: boolean;
  countdown: string;
  description: string;
  requirements: string;
  advanceAmount: number;
  commission: string;
  orderNumber?: string;
  mobileNumber?: string;
  serviceDate?: string;
  timeSlot?: string;
  createdAt: string;
  bitrix24Id: string;
}

interface UseRealtimeOrdersReturn {
  orders: RealtimeOrder[];
  isLoading: boolean;
  error: string | null;
  total: number;
  partner: {
    id: number;
    name: string;
    city: string;
    serviceType: string;
  } | null;
  refreshOrders: () => Promise<void>;
  acceptOrder: (orderId: string) => Promise<boolean>;
  isAccepting: boolean;
  cleanupOldOrders: () => Promise<void>;
  hasNewOrders: boolean;
  newOrdersCount: number;
  dismissNewOrdersNotification: () => void;
}

// Global interval management to avoid component lifecycle issues
let globalInterval: NodeJS.Timeout | null = null;
let globalFetchFunction: (() => Promise<void>) | null = null;

// Cleanup function for when the page is actually being closed
const cleanupGlobalInterval = () => {
  if (globalInterval) {
    console.log('🧹 Final cleanup: Clearing global interval');
    clearInterval(globalInterval);
    globalInterval = null;
    globalFetchFunction = null;
  }
};

// Set up page unload cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupGlobalInterval);
  window.addEventListener('unload', cleanupGlobalInterval);
}

export function useRealtimeOrders(refreshInterval: number = 30000): UseRealtimeOrdersReturn {
  const [orders, setOrders] = useState<RealtimeOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [partner, setPartner] = useState<{
    id: number;
    name: string;
    city: string;
    serviceType: string;
  } | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousOrdersCountRef = useRef(0);

  // Use useRef to store the fetch function to avoid dependency issues in React 19
  const fetchOrdersRef = useRef(async () => {
    console.log(`[${new Date().toLocaleTimeString()}] fetchOrdersRef called - starting fetch`);
    try {
      setError(null);
      setIsLoading(true);

      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Set a maximum loading time of 10 seconds (temporarily disabled for debugging)
      // loadingTimeoutRef.current = setTimeout(() => {
      //   if (isMountedRef.current) {
      //     setIsLoading(false);
      //   }
      // }, 10000);

      // Debug: Check if cookie exists
      console.log('Cookies before fetch:', document.cookie);
      
      const response = await fetch('/api/partners/realtime-orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        cache: 'no-cache', // Ensure fresh request
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', {
          status: response.status,
          message: errorData.message,
          error: errorData.error
        });
        
        // If it's an authentication error, redirect to login
        if (response.status === 401) {
          console.log('Authentication failed, redirecting to login');
          window.location.href = '/login';
          return;
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('API Response received:', {
        success: data.success,
        ordersCount: data.orders?.length || 0,
        total: data.total,
        partner: data.partner?.name
      });
      
      // Clear the timeout since we got a response
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Check if there are new orders (more orders than before)
      const currentOrdersCount = data.orders?.length || 0;
      const previousOrdersCount = previousOrdersCountRef.current;
      
      // Update state
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setPartner(data.partner || null);
      setIsLoading(false);
      
      // Check for new orders and update UI accordingly
      if (currentOrdersCount > previousOrdersCount && previousOrdersCount > 0) {
        const newOrders = currentOrdersCount - previousOrdersCount;
        console.log(`🆕 New orders detected! ${newOrders} new orders (${currentOrdersCount} total, was ${previousOrdersCount})`);
        
        // Update new orders state for UI notification
        setHasNewOrders(true);
        setNewOrdersCount(newOrders);
        
        // Auto-hide the notification after 5 seconds
        setTimeout(() => {
          setHasNewOrders(false);
          setNewOrdersCount(0);
        }, 5000);
      } else {
        console.log('State updated - orders:', currentOrdersCount, 'isLoading:', false);
        // Clear any previous new orders notification
        setHasNewOrders(false);
        setNewOrdersCount(0);
      }
      
      // Update the ref for next comparison
      previousOrdersCountRef.current = currentOrdersCount;
    } catch (err) {
      console.error('Error fetching realtime orders:', err);
      if (isMountedRef.current) {
        // Clear the timeout on error
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        setIsLoading(false);
      }
    }
  });

  const fetchOrders = useCallback(() => fetchOrdersRef.current(), []);

  const acceptOrder = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      setIsAccepting(true);
      setError(null);

      const response = await fetch('/api/partners/realtime-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Remove the accepted order from the list
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        setTotal(prevTotal => Math.max(0, prevTotal - 1));
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error accepting order:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to accept order');
      }
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsAccepting(false);
      }
    }
  }, []);

  const cleanupOldOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/partners/cleanup-old-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.deletedCount > 0) {
          console.log(`Cleaned up ${data.deletedCount} old orders`);
          // Refresh orders after cleanup
          await fetchOrdersRef.current();
        }
      }
    } catch (error) {
      console.error('Error cleaning up old orders:', error);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    await fetchOrdersRef.current();
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrdersRef.current();
  }, []);

  // Set up auto-refresh interval using global approach
  useEffect(() => {
    console.log('⏰ Setting up auto-refresh interval:', refreshInterval, 'isMounted:', isMountedRef.current);
    
    if (refreshInterval <= 0) {
      console.log('❌ Skipping interval setup - refreshInterval is 0 or negative');
      return;
    }

    // Store the fetch function globally
    globalFetchFunction = fetchOrdersRef.current;

    // Only create global interval if it doesn't exist
    if (!globalInterval) {
      console.log('🔄 Creating new global interval with refreshInterval:', refreshInterval);
      globalInterval = setInterval(() => {
        console.log(`[${new Date().toLocaleTimeString()}] ⏰ Global auto-refresh triggered`);
        // Always try to fetch using the global function
        try {
          console.log(`[${new Date().toLocaleTimeString()}] 📡 Calling global fetch function`);
          if (globalFetchFunction) {
            globalFetchFunction();
          }
        } catch (error) {
          console.log(`[${new Date().toLocaleTimeString()}] ❌ Error in global interval fetch:`, error);
        }
      }, refreshInterval);
      console.log('✅ Global interval created with ID:', globalInterval);
    } else {
      console.log('🔄 Global interval already exists, updating fetch function only');
    }

    // Also set up a visibility change listener to handle tab focus
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Tab became visible, refreshing orders');
        if (globalFetchFunction) {
          globalFetchFunction();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('🧹 Cleaning up global interval, current ID:', globalInterval);
      // Don't clear the global interval here - let it run
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshInterval]);

  // Set up periodic cleanup (every 2 hours)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (isMountedRef.current) {
        cleanupOldOrders();
      }
    }, 2 * 60 * 60 * 1000); // 2 hours

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [cleanupOldOrders]);

  // Cleanup on unmount
  useEffect(() => {
    console.log('🚀 useRealtimeOrders hook mounted, isMounted:', isMountedRef.current);
    isMountedRef.current = true; // Ensure it's set to true on mount
    return () => {
      console.log('💀 useRealtimeOrders hook unmounting');
      isMountedRef.current = false;
      
      // Clear local intervals
      if (intervalRef.current) {
        console.log('Clearing local interval on unmount');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      // Don't clear global interval immediately - let it persist
      console.log('💀 Component unmounting, but keeping global interval running');
    };
  }, []);

  // Function to dismiss new orders notification
  const dismissNewOrdersNotification = useCallback(() => {
    setHasNewOrders(false);
    setNewOrdersCount(0);
  }, []);

  // In React 19, we can return the object directly as the compiler optimizes this
  return {
    orders,
    isLoading,
    error,
    total,
    partner,
    refreshOrders,
    acceptOrder,
    isAccepting,
    cleanupOldOrders,
    hasNewOrders,
    newOrdersCount,
    dismissNewOrdersNotification,
  };
}
