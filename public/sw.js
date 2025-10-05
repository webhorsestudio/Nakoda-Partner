// Minimal Service Worker for Nakoda Partner
// No longer handles Global Order Sync - orders are now managed manually by admin users

const CACHE_NAME = 'nakoda-partner-v1';

console.log('🔧 Service Worker: Initializing minimal service worker...');

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🔧 Service Worker: Activating...');
  event.waitUntil(self.clients.claim());
});

// Message event handler (for future use)
self.addEventListener('message', (event) => {
  console.log('🔧 Service Worker: Received message', event.data);
  
  // Handle any future service worker messages here
  if (event.data.type === 'PING') {
    event.ports[0].postMessage({ type: 'PONG', data: 'Service worker is active' });
  }
});

console.log('✅ Service Worker: Minimal service worker initialized successfully');