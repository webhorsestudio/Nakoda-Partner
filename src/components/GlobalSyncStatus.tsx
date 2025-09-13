'use client';

import React, { useState, useEffect } from 'react';
import { globalOrderFetcher } from '@/services/globalOrderFetcher';

interface GlobalSyncStatusProps {
  className?: string;
}

export function GlobalSyncStatus({ className = '' }: GlobalSyncStatusProps) {
  const [status, setStatus] = useState({
    isRunning: false,
    lastSync: null as Date | null,
    retryCount: 0
  });

  useEffect(() => {
    // Get initial status
    const initialStatus = globalOrderFetcher.getStatus();
    setStatus(initialStatus);

    // Update status every 30 seconds
    const interval = setInterval(() => {
      const currentStatus = globalOrderFetcher.getStatus();
      setStatus(currentStatus);
    }, 30000);

    // Listen for global order updates
    const handleGlobalOrdersUpdated = () => {
      const currentStatus = globalOrderFetcher.getStatus();
      setStatus(currentStatus);
    };

    window.addEventListener('globalOrdersUpdated', handleGlobalOrdersUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('globalOrdersUpdated', handleGlobalOrdersUpdated);
    };
  }, []);

  const formatLastSync = (lastSync: Date | null) => {
    if (!lastSync) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getStatusColor = () => {
    if (!status.isRunning) return 'text-gray-500';
    if (status.retryCount > 0) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!status.isRunning) return '⏸️';
    if (status.retryCount > 0) return '⚠️';
    return '🔄';
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <span className={getStatusColor()}>
        {getStatusIcon()}
      </span>
      <span className="text-gray-600">
        Global Sync: {status.isRunning ? 'Running' : 'Stopped'}
      </span>
      {status.lastSync && (
        <span className="text-gray-500">
          • Last: {formatLastSync(status.lastSync)}
        </span>
      )}
      {status.retryCount > 0 && (
        <span className="text-yellow-600">
          • Retries: {status.retryCount}
        </span>
      )}
    </div>
  );
}
