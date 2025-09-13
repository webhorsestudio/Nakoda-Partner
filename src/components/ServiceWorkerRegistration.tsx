'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('🌍 Service Worker: Registered successfully', registration);
          
          // Don't start global fetcher here - let the contexts handle it based on user role
          // The service worker will auto-start its own global fetcher
          
          // Listen for service worker messages
          navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('🌍 Client: Received message from service worker', event.data);
            
            // Handle different message types
            switch (event.data.type) {
              case 'GLOBAL_ORDERS_UPDATED':
                console.log('🔄 Client: Global orders updated', event.data.data);
                // Emit custom event for other components to listen
                window.dispatchEvent(new CustomEvent('globalOrdersUpdated', {
                  detail: event.data.data
                }));
                break;
                
              case 'GLOBAL_FETCHER_STARTED':
                console.log('✅ Client: Global fetcher started');
                break;
                
              case 'GLOBAL_FETCHER_STOPPED':
                console.log('🛑 Client: Global fetcher stopped');
                break;
                
              case 'GLOBAL_SYNC_ERROR':
                console.error('❌ Client: Global sync error', event.data.data);
                break;
                
              default:
                console.log('📡 Client: Unknown message type', event.data.type);
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    } else {
      console.warn('⚠️ Service Worker not supported in this browser');
    }
  }, []);

  return null; // This component doesn't render anything
}
