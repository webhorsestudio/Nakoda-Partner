import { getBackgroundAutoFetchService, destroyBackgroundAutoFetchService } from '@/services/backgroundAutoFetchService';

// Extend ServiceWorkerRegistration to include periodicSync
interface ServiceWorkerRegistrationWithPeriodicSync extends ServiceWorkerRegistration {
  periodicSync?: {
    register(tag: string, options: { minInterval: number }): Promise<void>;
  };
}

// Initialize background services when the app starts
export function initializeBackgroundServices() {
  if (typeof window !== 'undefined') {
    try {
      // Initialize the background auto-fetch service
      const backgroundService = getBackgroundAutoFetchService();
      
      // Check if auto-fetch was previously enabled
      const wasEnabled = localStorage.getItem('backgroundAutoFetchEnabled') === 'true';
      
      if (wasEnabled) {
        // The service will automatically start if it was previously enabled
      }
      
      // Set up periodic background sync if supported
      if ('serviceWorker' in navigator && 'periodicSync' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          const regWithPeriodicSync = registration as ServiceWorkerRegistrationWithPeriodicSync;
          if (regWithPeriodicSync.periodicSync) {
            // Register for periodic background sync
            regWithPeriodicSync.periodicSync.register('orders-sync', {
              minInterval: 5 * 60 * 1000, // 5 minutes minimum
            }).then(() => {
              // Periodic background sync registered successfully
            }).catch((error) => {
              console.error('Periodic background sync not supported:', error);
            });
          }
        });
      }
      
      return backgroundService;
    } catch (error) {
      console.error('Failed to initialize background services:', error);
      return null;
    }
  }
  return null;
}

// Check if background services are supported
export function areBackgroundServicesSupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'serviceWorker' in navigator &&
    'localStorage' in window &&
    'fetch' in window
  );
}

// Get the current status of background services
export function getBackgroundServicesStatus() {
  if (typeof window === 'undefined') return null;
  
  try {
    const backgroundService = getBackgroundAutoFetchService();
    const status = backgroundService.getStatus();
    
    return {
      autoFetch: status,
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window && Notification.permission === 'granted',
      periodicSync: 'periodicSync' in navigator,
    };
  } catch (error) {
    console.error('Error getting background services status:', error);
    return null;
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

// Clean up background services
export function cleanupBackgroundServices() {
  if (typeof window !== 'undefined') {
    try {
      // Unregister service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
          });
        });
      }
      
      // Clear background service
      destroyBackgroundAutoFetchService();
      
    } catch (error) {
      console.error('Error cleaning up background services:', error);
    }
  }
}
