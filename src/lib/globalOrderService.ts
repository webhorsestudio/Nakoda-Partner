import { globalOrderManager, OrderState } from './globalOrderManager';

// Global service that runs independently of components
class GlobalOrderService {
  private isInitialized = false;
  private refreshInterval: number = 10000; // 10 seconds

  // Initialize the service - call this once when the app starts
  initialize(refreshInterval: number = 10000) {
    if (this.isInitialized) {
      console.log('🔄 Global Order Service: Already initialized');
      return;
    }

    console.log('🚀 Global Order Service: Initializing global order fetching...');
    this.refreshInterval = refreshInterval;
    
    // Initialize the global manager
    globalOrderManager.initialize(refreshInterval);
    
    // Start the service
    this.startService();
    
    this.isInitialized = true;
    console.log('✅ Global Order Service: Initialized successfully');
  }

  // Start the background service
  private startService() {
    console.log('🔄 Global Order Service: Starting background order fetching...');
    
    // The global manager already handles the interval, so we just need to ensure it's running
    // This service acts as a wrapper to ensure it runs globally
  }

  // Get current state
  getState() {
    return globalOrderManager.getState();
  }

  // Subscribe to state changes
  subscribe(callback: (state: OrderState) => void) {
    return globalOrderManager.subscribe(callback);
  }

  // Manual refresh
  refresh() {
    return globalOrderManager.refresh();
  }

  // Accept order
  acceptOrder(orderId: string) {
    return globalOrderManager.acceptOrder(orderId);
  }

  // Cleanup old orders
  cleanupOldOrders() {
    return globalOrderManager.cleanupOldOrders();
  }

  // Dismiss new orders notification
  dismissNewOrdersNotification() {
    return globalOrderManager.dismissNewOrdersNotification();
  }

  // Stop the service (for cleanup)
  stop() {
    console.log('🛑 Global Order Service: Stopping...');
    globalOrderManager.destroy();
    this.isInitialized = false;
  }
}

// Create singleton instance
export const globalOrderService = new GlobalOrderService();

// Don't auto-initialize - let components initialize when needed
// This prevents API calls before user is authenticated
