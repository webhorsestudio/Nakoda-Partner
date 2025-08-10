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

  private loadState() {
    try {
      const savedEnabled = localStorage.getItem('backgroundAutoFetchEnabled');
      const savedLastFetch = localStorage.getItem('backgroundLastFetchTime');
      
      this.isEnabled = savedEnabled ? JSON.parse(savedEnabled) : false;
      this.lastFetchTime = savedLastFetch ? new Date(savedLastFetch) : null;
      
      console.log('Background AutoFetch Service: State loaded', {
        isEnabled: this.isEnabled,
        lastFetchTime: this.lastFetchTime
      });
    } catch (error) {
      console.error('Background AutoFetch Service: Error loading state:', error);
    }
  }

  private saveState() {
    try {
      localStorage.setItem('backgroundAutoFetchEnabled', JSON.stringify(this.isEnabled));
      if (this.lastFetchTime) {
        localStorage.setItem('backgroundLastFetchTime', this.lastFetchTime.toISOString());
      }
    } catch (error) {
      console.error('Background AutoFetch Service: Error saving state:', error);
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
      console.log('Background AutoFetch Service: Page hidden, pausing countdown');
    } else {
      // Page is visible again, resume countdown
      console.log('Background AutoFetch Service: Page visible, resuming countdown');
    }
  }

  public start() {
    if (this.intervalId) {
      this.stop(); // Clear existing interval
    }

    this.isEnabled = true;
    this.countdown = 300; // Reset to 5 minutes
    this.saveState();
    
    console.log('Background AutoFetch Service: Started');

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
    
    console.log('Background AutoFetch Service: Stopped');
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
      console.log('Background AutoFetch Service: Fetch already in progress, skipping');
      return;
    }

    try {
      this.isFetching = true;
      console.log('Background AutoFetch Service: Starting background sync...');
      
      const response = await fetch('/api/orders/sync', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        this.lastFetchTime = new Date();
        this.saveState();
        
        console.log('Background AutoFetch Service: Sync successful', result);
        
        // Show notification if page is visible
        if (!document.hidden && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Orders Synced', {
            body: `Successfully synced ${result.data?.created || 0} new orders`,
            icon: '/favicon.ico'
          });
        }
      } else {
        console.error('Background AutoFetch Service: Sync failed with status', response.status);
      }
    } catch (error) {
      console.error('Background AutoFetch Service: Sync error:', error);
    } finally {
      this.isFetching = false;
    }
  }

  public async triggerManualFetch() {
    await this.performFetch();
    this.countdown = 300; // Reset countdown after manual fetch
    localStorage.setItem('backgroundAutoFetchCountdown', this.countdown.toString());
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
