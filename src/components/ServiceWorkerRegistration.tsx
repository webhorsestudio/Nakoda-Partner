'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('🔧 Service Worker: Registered successfully', registration);
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
