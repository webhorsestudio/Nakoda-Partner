// Service Worker for 24/7 Global Order Fetching
// This ensures orders are fetched continuously even when the browser is closed

const CACHE_NAME = 'nakoda-partner-global-v1';
const GLOBAL_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 30 * 1000; // 30 seconds

let syncIntervalId = null;
let retryCount = 0;
let isRunning = false;

console.log('🌍 Service Worker: Initializing global order fetcher...');

// Install event
self.addEventListener('install', (event) => {
  console.log('🌍 Service Worker: Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🌍 Service Worker: Activating...');
  event.waitUntil(self.clients.claim());
});

// Message event handler
self.addEventListener('message', (event) => {
  console.log('🌍 Service Worker: Received message', event.data);
  
  if (event.data.type === 'START_GLOBAL_FETCHER') {
    startGlobalOrderFetcher();
  } else if (event.data.type === 'STOP_GLOBAL_FETCHER') {
    stopGlobalOrderFetcher();
  } else if (event.data.type === 'GET_STATUS') {
    getStatus().then(status => {
      event.ports[0].postMessage({ type: 'STATUS_RESPONSE', data: status });
    });
  }
});

// Background sync event (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'global-order-sync') {
    console.log('🌍 Service Worker: Background sync triggered');
    event.waitUntil(performGlobalSync());
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'global-order-sync') {
    console.log('🌍 Service Worker: Periodic sync triggered');
    event.waitUntil(performGlobalSync());
  }
});

/**
 * Start the global order fetcher
 */
async function startGlobalOrderFetcher() {
  if (isRunning) {
    console.log('🌍 Service Worker: Already running');
    return;
  }

  isRunning = true;
  retryCount = 0;
  console.log('🌍 Service Worker: Starting global order fetcher...');
  
  try {
    // Initial sync
    await performGlobalSync();
    
    // Set up interval for continuous syncing
    syncIntervalId = setInterval(async () => {
      await performGlobalSync();
    }, GLOBAL_SYNC_INTERVAL);
    
    console.log('✅ Service Worker: Global order fetcher started successfully');
    
    // Notify all clients
    await notifyClients({
      type: 'GLOBAL_FETCHER_STARTED',
      data: { message: 'Global order fetcher started' }
    });
    
  } catch (error) {
    console.error('❌ Service Worker: Failed to start global order fetcher', error);
    isRunning = false;
  }
}

/**
 * Stop the global order fetcher
 */
async function stopGlobalOrderFetcher() {
  if (!isRunning) {
    console.log('🌍 Service Worker: Already stopped');
    return;
  }

  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
  
  isRunning = false;
  retryCount = 0;
  console.log('🛑 Service Worker: Global order fetcher stopped');
  
  // Notify all clients
  await notifyClients({
    type: 'GLOBAL_FETCHER_STOPPED',
    data: { message: 'Global order fetcher stopped' }
  });
}

/**
 * Perform global order synchronization
 */
async function performGlobalSync() {
  try {
    console.log('🌍 Service Worker: Performing global sync...');
    
    const response = await fetch('/api/orders/global-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache'
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Service Worker: Global sync completed', result);
      
      retryCount = 0; // Reset retry count on success
      
      // Notify all clients about the update
      await notifyClients({
        type: 'GLOBAL_ORDERS_UPDATED',
        data: result
      });
      
      return result;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
  } catch (error) {
    console.error('❌ Service Worker: Global sync failed', error);
    
    // Implement retry logic
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      const retryDelay = RETRY_DELAY * Math.pow(2, retryCount - 1); // Exponential backoff
      
      console.log(`🔄 Service Worker: Retrying in ${retryDelay}ms (attempt ${retryCount}/${MAX_RETRIES})`);
      
      setTimeout(async () => {
        await performGlobalSync();
      }, retryDelay);
    } else {
      console.error('❌ Service Worker: Max retries exceeded');
      retryCount = 0; // Reset for next cycle
      
      // Notify clients about the error
      await notifyClients({
        type: 'GLOBAL_SYNC_ERROR',
        data: { error: error.message, retryCount: MAX_RETRIES }
      });
    }
    
    throw error;
  }
}

/**
 * Notify all connected clients about updates
 */
async function notifyClients(message) {
  try {
    const clients = await self.clients.matchAll();
    console.log(`📡 Service Worker: Notifying ${clients.length} clients`, message);
    
    clients.forEach(client => {
      client.postMessage(message);
    });
  } catch (error) {
    console.error('❌ Service Worker: Failed to notify clients', error);
  }
}

/**
 * Get current status of the service worker
 */
async function getStatus() {
  return {
    isRunning,
    retryCount,
    lastSync: new Date().toISOString(),
    interval: GLOBAL_SYNC_INTERVAL,
    maxRetries: MAX_RETRIES
  };
}

// Auto-start the global fetcher for true 24/7 operation
// Service Worker runs independently of user login status
console.log('🌍 Service Worker: Auto-starting 24/7 global order fetcher...');
startGlobalOrderFetcher().catch(console.error);