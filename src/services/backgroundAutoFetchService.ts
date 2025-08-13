class BackgroundAutoFetchService {
  private intervalId: NodeJS.Timeout | null = null;
  private countdown: number = 300; // 5 minutes
  private isEnabled: boolean = false;
  private lastFetchTime: Date | null = null;
  private isFetching: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Load state from localStorage
    this.loadState();
    
    // Start the service if it was previously enabled
    if (this.isEnabled) {
      this.start();
    }

    // Listen for storage changes (when other tabs/windows update the state)
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Listen for page visibility changes to pause/resume when tab is not active
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  private loadState(): void {
    try {
      const savedState = localStorage.getItem('backgroundAutoFetchState');
      if (savedState) {
        const state = JSON.parse(savedState);
        this.isEnabled = state.isEnabled || false;
        this.countdown = state.countdown || this.countdown;
        this.lastFetchTime = state.lastFetchTime ? new Date(state.lastFetchTime) : null;
      }
    } catch (error) {
      console.error('Error loading background auto-fetch state:', error);
    }
  }

  private saveState(): void {
    try {
      const state = {
        isEnabled: this.isEnabled,
        countdown: this.countdown,
        lastFetchTime: this.lastFetchTime?.toISOString()
      };
      localStorage.setItem('backgroundAutoFetchState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving background auto-fetch state:', error);
    }
  }

  private handleStorageChange(event: StorageEvent) {
    if (event.key === 'backgroundAutoFetchEnabled') {
      const newEnabled = event.newValue ? JSON.parse(event.newValue) : false;
      if (newEnabled !== this.isEnabled) {
        this.isEnabled = newEnabled;
        if (newEnabled) {
          this.start();
        } else {
          this.stop();
        }
      }
    }
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, pause countdown but keep interval running
    } else {
      // Page is visible again, resume countdown
    }
  }

  public start() {
    if (this.intervalId) {
      this.stop(); // Clear existing interval
    }

    this.isEnabled = true;
    this.countdown = 300; // Reset to 5 minutes
    this.saveState();

    this.intervalId = setInterval(() => {
      if (this.isEnabled && !this.isFetching) {
        this.countdown--;
        
        // Update countdown in localStorage for UI components to read
        localStorage.setItem('backgroundAutoFetchCountdown', this.countdown.toString());
        
        if (this.countdown <= 0) {
          this.performFetch();
          this.countdown = 300; // Reset to 5 minutes
        }
      }
    }, 1000);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isEnabled = false;
    this.saveState();
  }

  public toggle() {
    if (this.isEnabled) {
      this.stop();
    } else {
      this.start();
    }
    return this.isEnabled;
  }

  public getStatus() {
    return {
      isEnabled: this.isEnabled,
      countdown: this.countdown,
      lastFetchTime: this.lastFetchTime,
      isFetching: this.isFetching
    };
  }

  public async performFetch() {
    if (this.isFetching) {
      return;
    }

    try {
      this.isFetching = true;
      
      const response = await fetch('/api/orders/sync', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        this.lastFetchTime = new Date();
        this.saveState();
        
        // Emit custom event to notify components that new data is available
        this.emitDataFetchedEvent(result.data);
        
        // Show notification if page is visible
        if (!document.hidden && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Orders Synced', {
            body: `Successfully synced ${result.data?.created || 0} new orders`,
            icon: '/favicon.ico'
          });
        }
        return result.data; // Return data for manual fetch
      } else {
        console.error('Background AutoFetch Service: Sync failed with status', response.status);
        return null; // Return null on failure
      }
    } catch (error) {
      console.error('Background AutoFetch Service: Sync error:', error);
      return null; // Return null on error
    } finally {
      this.isFetching = false;
    }
  }

  // Emit custom event when new data is fetched
  private emitDataFetchedEvent(data: { created?: number; updated?: number } | null) {
    const event = new CustomEvent('ordersDataFetched', {
      detail: {
        timestamp: new Date(),
        data: data,
        source: 'backgroundService'
      }
    });
    window.dispatchEvent(event);
  }

  public async triggerManualFetch() {
    const result = await this.performFetch();
    this.countdown = 300; // Reset countdown after manual fetch
    localStorage.setItem('backgroundAutoFetchCountdown', this.countdown.toString());
    
    // Emit event for manual fetch as well
    if (result) {
      this.emitDataFetchedEvent(result);
    }
  }

  public destroy() {
    this.stop();
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }
}

// Create singleton instance
let backgroundService: BackgroundAutoFetchService | null = null;

export function getBackgroundAutoFetchService(): BackgroundAutoFetchService {
  if (!backgroundService) {
    backgroundService = new BackgroundAutoFetchService();
  }
  return backgroundService;
}

export function destroyBackgroundAutoFetchService() {
  if (backgroundService) {
    backgroundService.destroy();
    backgroundService = null;
  }
}

// Export the class for testing purposes
export { BackgroundAutoFetchService };
