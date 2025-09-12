// Global Order Manager for React 19 + Next.js 15+
// This creates a singleton pattern for managing orders globally

interface Task {
  id: string;
  title: string;
  description: string;
  customerName: string;
  customerPhone: string;
  location: string;
  amount: number;
  advanceAmount: number;
  serviceType: string;
  priority: string;
  estimatedDuration: string;
  createdAt: string;
  status: string;
}

interface PartnerInfo {
  id: number;
  name: string;
  city: string;
  serviceType: string;
}

interface OrderState {
  orders: Task[];
  isLoading: boolean;
  error: string | null;
  total: number;
  partner: PartnerInfo | null;
  hasNewOrders: boolean;
  newOrdersCount: number;
  lastFetchTime: number;
}

type OrderStateListener = (state: OrderState) => void;

class GlobalOrderManager {
  private state: OrderState = {
    orders: [],
    isLoading: false,
    error: null,
    total: 0,
    partner: null,
    hasNewOrders: false,
    newOrdersCount: 0,
    lastFetchTime: 0,
  };

  private listeners: Set<OrderStateListener> = new Set();
  private intervalId: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private previousOrdersCount = 0;

  // Singleton pattern
  private static instance: GlobalOrderManager;
  
  static getInstance(): GlobalOrderManager {
    if (!GlobalOrderManager.instance) {
      GlobalOrderManager.instance = new GlobalOrderManager();
    }
    return GlobalOrderManager.instance;
  }

  // Subscribe to state changes
  subscribe(listener: OrderStateListener): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.state);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners of state changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Update state and notify listeners
  private updateState(updates: Partial<OrderState>): void {
    const newState = { ...this.state, ...updates };
    
    // More efficient comparison - only check specific fields that matter
    const hasChanged = 
      this.state.isLoading !== newState.isLoading ||
      this.state.error !== newState.error ||
      this.state.orders.length !== newState.orders.length ||
      this.state.total !== newState.total ||
      this.state.partner?.id !== newState.partner?.id ||
      this.state.hasNewOrders !== newState.hasNewOrders ||
      this.state.newOrdersCount !== newState.newOrdersCount ||
      JSON.stringify(this.state.orders) !== JSON.stringify(newState.orders);
    
    if (hasChanged) {
      console.log('🔄 Global Order Manager: State changed, updating listeners');
      this.state = newState;
      this.notifyListeners();
    } else {
      console.log('⏭️ Global Order Manager: State unchanged, skipping update');
    }
  }

  // Fetch orders from API
  private async fetchOrders(): Promise<void> {
    if (this.state.isLoading) return; // Prevent concurrent fetches

    // Check if user is authenticated before making API call
    const token = localStorage.getItem('auth-token');
    if (!token) {
      console.log('❌ Global Order Manager: No auth token found, skipping API call');
      this.updateState({ isLoading: false, error: 'Not authenticated' });
      return;
    }

    console.log('🔄 Global Order Manager: Fetching orders...');
    this.updateState({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/partners/realtime-orders', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Add Authorization header
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
      console.log('✅ Global Order Manager: API Response received:', result);

      if (result.success) {
        const newOrdersCount = result.ordersCount || 0;
        const hasNewOrders = newOrdersCount > this.previousOrdersCount && this.previousOrdersCount > 0;
        
        // Check if orders actually changed
        const newOrders = result.orders || [];
        const ordersChanged = JSON.stringify(this.state.orders) !== JSON.stringify(newOrders);
        
        // Only update if data actually changed or there was an error
        if (ordersChanged || this.state.error) {
          this.updateState({
            orders: newOrders,
            total: result.total || 0,
            partner: result.partner || null,
            isLoading: false,
            error: null,
            hasNewOrders: ordersChanged ? hasNewOrders : false,
            newOrdersCount: ordersChanged ? (hasNewOrders ? newOrdersCount - this.previousOrdersCount : 0) : 0,
            lastFetchTime: Date.now(),
          });
          console.log('✅ Global Order Manager: State updated successfully');
        } else {
          // Data is identical, only update internal state without triggering listeners
          this.state.isLoading = false;
          this.state.error = null;
          console.log('⏭️ Global Order Manager: Data unchanged, skipping state update entirely');
        }

        this.previousOrdersCount = newOrdersCount;
      } else {
        throw new Error(result.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('❌ Global Order Manager: Fetch error:', error);
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
      });
    }
  }

  // Initialize the global order manager
  initialize(refreshInterval: number = 30000): void {
    if (this.isInitialized) {
      console.log('🔄 Global Order Manager: Already initialized, updating interval');
      this.setRefreshInterval(refreshInterval);
      return;
    }

    console.log('🚀 Global Order Manager: Initializing...');
    this.isInitialized = true;

    // Initial fetch
    this.fetchOrders();

    // Set up auto-refresh
    this.setRefreshInterval(refreshInterval);

    // Set up visibility change listener
    if (typeof window !== 'undefined') {
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          console.log('👁️ Global Order Manager: Tab became visible, refreshing...');
          this.fetchOrders();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  }

  // Set refresh interval
  setRefreshInterval(interval: number): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    if (interval > 0) {
      this.intervalId = setInterval(() => {
        console.log('⏰ Global Order Manager: Auto-refresh triggered');
        this.fetchOrders();
      }, interval);
      console.log(`✅ Global Order Manager: Auto-refresh set to ${interval}ms`);
    }
  }

  // Manual refresh
  refresh(): void {
    console.log('🔄 Global Order Manager: Manual refresh triggered');
    this.fetchOrders();
  }

  // Dismiss new orders notification
  dismissNewOrdersNotification(): void {
    this.updateState({
      hasNewOrders: false,
      newOrdersCount: 0,
    });
  }

  // Accept order
  async acceptOrder(orderId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/partners/realtime-orders', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        // Remove accepted order from state
        this.updateState({
          orders: this.state.orders.filter(order => order.id !== orderId),
          total: this.state.total - 1,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error accepting order:', error);
      return false;
    }
  }

  // Cleanup old orders
  async cleanupOldOrders(): Promise<void> {
    try {
      await fetch('/api/partners/cleanup-old-orders', {
        method: 'POST',
        credentials: 'include',
      });
      console.log('✅ Global Order Manager: Old orders cleaned up');
    } catch (error) {
      console.error('❌ Global Order Manager: Cleanup failed:', error);
    }
  }

  // Get current state
  getState(): OrderState {
    return { ...this.state };
  }

  // Cleanup
  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners.clear();
    this.isInitialized = false;
    console.log('🧹 Global Order Manager: Destroyed');
  }
}

// Export singleton instance
export const globalOrderManager = GlobalOrderManager.getInstance();

// Export types
export type { Task, PartnerInfo, OrderState };
