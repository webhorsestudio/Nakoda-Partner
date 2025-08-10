// Service Worker for Background Auto-Fetch
const CACHE_NAME = 'nakoda-partner-auto-fetch-v1';

// Install event - cache necessary resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        return cache.addAll([
          '/',
          '/admin/orders',
          '/api/orders/sync'
        ]);
      })
      .catch((error) => {
        console.error('Service Worker: Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-auto-fetch') {
    event.waitUntil(performBackgroundSync());
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync triggered:', event.tag);
  
  if (event.tag === 'orders-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

// Perform the actual background sync
async function performBackgroundSync() {
  try {
    console.log('Service Worker: Starting background sync...');
    
    const response = await fetch('/api/orders/sync', {
      method: 'POST',
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Service Worker: Background sync successful:', result);
      
      // Update the last sync time in IndexedDB or localStorage
      const syncData = {
        lastSync: new Date().toISOString(),
        syncedCount: result.data?.created || 0,
        success: true
      };
      
      // Store sync data for the main app to read
      if ('indexedDB' in self) {
        // Use IndexedDB if available
        const db = await openDB('nakoda-partner', 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('syncData')) {
              db.createObjectStore('syncData', { keyPath: 'id' });
            }
          },
        });
        
        await db.put('syncData', { id: 'lastSync', ...syncData });
      }
      
      // Show notification if possible
      if ('Notification' in self && Notification.permission === 'granted') {
        self.registration.showNotification('Orders Synced', {
          body: `Successfully synced ${result.data?.created || 0} new orders`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'orders-sync'
        });
      }
    } else {
      console.error('Service Worker: Background sync failed with status:', response.status);
    }
  } catch (error) {
    console.error('Service Worker: Background sync error:', error);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New orders available',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'orders-update',
      data: data
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Nakoda Partner', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/admin/orders')
  );
});

// Handle fetch events for offline support
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/orders/sync')) {
    // Handle API requests
    event.respondWith(
      fetch(event.request)
        .catch((error) => {
          console.error('Service Worker: Fetch failed, serving from cache:', error);
          return caches.match(event.request);
        })
    );
  }
});

// Helper function to open IndexedDB
function openDB(name, version, upgradeCallback) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => upgradeCallback(request.result, event);
  });
}
