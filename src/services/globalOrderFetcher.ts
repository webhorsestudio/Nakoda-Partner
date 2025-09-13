import { orderService } from './orderService';
import { bitrix24Service } from './bitrix24Service';

interface GlobalSyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  lastSync: string;
}

class GlobalOrderFetcher {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private retryCount = 0;
  private lastSyncTime: Date | null = null;

  constructor() {
    console.log('🌍 Global Order Fetcher: Initialized');
  }

  /**
   * Start the 24/7 global order fetching service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('🌍 Global Order Fetcher: Already running');
      return;
    }

    this.isRunning = true;
    this.retryCount = 0;
    console.log('🌍 Global Order Fetcher: Starting 24/7 service...');
    
    try {
      // Initial fetch
      await this.fetchAndStoreOrders();
      
      // Set up interval for continuous fetching
      this.intervalId = setInterval(async () => {
        await this.fetchAndStoreOrders();
      }, this.FETCH_INTERVAL);
      
      console.log('✅ Global Order Fetcher: Started successfully');
    } catch (error) {
      console.error('❌ Global Order Fetcher: Failed to start', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop the global order fetching service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('🌍 Global Order Fetcher: Already stopped');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    this.retryCount = 0;
    console.log('🛑 Global Order Fetcher: Stopped');
  }

  /**
   * Get current status of the global fetcher
   */
  getStatus(): { isRunning: boolean; lastSync: Date | null; retryCount: number } {
    return {
      isRunning: this.isRunning,
      lastSync: this.lastSyncTime,
      retryCount: this.retryCount
    };
  }

  /**
   * Force a manual sync (useful for testing or immediate updates)
   */
  async forceSync(): Promise<GlobalSyncResult> {
    console.log('🔄 Global Order Fetcher: Force sync requested');
    return await this.fetchAndStoreOrders();
  }

  /**
   * Main method to fetch orders from Bitrix24 and store them
   */
  private async fetchAndStoreOrders(): Promise<GlobalSyncResult> {
    try {
      console.log('🌍 Global Order Fetcher: Fetching orders from Bitrix24...');
      
      // Use existing orderService for consistency
      const result = await orderService.syncRecentOrdersFromBitrix24();
      
      // Update last sync time
      this.lastSyncTime = new Date();
      this.retryCount = 0; // Reset retry count on success
      
      const syncResult: GlobalSyncResult = {
        created: result.created,
        updated: result.updated,
        skipped: result.skipped,
        errors: result.errors,
        lastSync: this.lastSyncTime.toISOString()
      };
      
      console.log('✅ Global Order Fetcher: Sync completed', syncResult);
      
      // Emit event for real-time updates
      this.emitOrdersUpdated(syncResult);
      
      return syncResult;
      
    } catch (error) {
      console.error('❌ Global Order Fetcher: Sync failed', error);
      
      // Implement retry logic
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        const retryDelay = Math.pow(2, this.retryCount) * 1000; // Exponential backoff
        
        console.log(`🔄 Global Order Fetcher: Retrying in ${retryDelay}ms (attempt ${this.retryCount}/${this.MAX_RETRIES})`);
        
        setTimeout(async () => {
          await this.fetchAndStoreOrders();
        }, retryDelay);
      } else {
        console.error('❌ Global Order Fetcher: Max retries exceeded, stopping');
        this.retryCount = 0; // Reset for next cycle
      }
      
      // Return error result
      return {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 1,
        lastSync: this.lastSyncTime?.toISOString() || new Date().toISOString()
      };
    }
  }

  /**
   * Emit custom event to notify all systems about order updates
   */
  private emitOrdersUpdated(result: GlobalSyncResult): void {
    try {
      // Emit browser event for client-side listeners
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('globalOrdersUpdated', {
          detail: {
            result,
            timestamp: new Date().toISOString(),
            source: 'globalOrderFetcher'
          }
        });
        
        window.dispatchEvent(event);
        console.log('📡 Global Order Fetcher: Event emitted to clients');
      }
      
      // Also emit to service worker if available
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          if (registration.active) {
            registration.active.postMessage({
              type: 'GLOBAL_ORDERS_UPDATED',
              data: result
            });
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Global Order Fetcher: Failed to emit event', error);
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    isRunning: boolean;
    lastSync: Date | null;
    retryCount: number;
    nextSyncIn?: number;
  }> {
    const status = this.getStatus();
    const nextSyncIn = this.intervalId ? this.FETCH_INTERVAL : undefined;
    
    return {
      ...status,
      nextSyncIn
    };
  }
}

// Create singleton instance
export const globalOrderFetcher = new GlobalOrderFetcher();

// Don't auto-start - let the contexts handle initialization based on user role
// This ensures proper role-based access control
