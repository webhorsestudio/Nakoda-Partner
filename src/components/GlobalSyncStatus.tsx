'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
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
  const [isManualSyncing, setIsManualSyncing] = useState(false);

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

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      const response = await fetch('/api/orders/global-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('🔄 Manual sync initiated successfully');
        console.log('Manual sync result:', result);
      } else {
        toast.error('❌ Failed to initiate manual sync');
      }
    } catch (error) {
      console.error('Manual sync error:', error);
      toast.error('❌ Manual sync failed');
    } finally {
      setIsManualSyncing(false);
    }
  };

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className={getStatusColor()}>
            {getStatusIcon()}
          </span>
          <div>
            <p className="text-sm font-medium text-blue-900">
              Global Sync: {status.isRunning ? 'Running (every 5 minutes)' : 'Stopped'}
            </p>
            <p className="text-xs text-blue-700">
              Last sync: {formatLastSync(status.lastSync)}
              {status.retryCount > 0 && ` • Retries: ${status.retryCount}`}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleManualSync}
          disabled={isManualSyncing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          {isManualSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
    </div>
  );
}
