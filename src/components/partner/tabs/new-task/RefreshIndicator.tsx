import React from 'react';

interface RefreshIndicatorProps {
  isLoading: boolean;
  onRefresh: () => void;
  refreshInterval: number;
}

export default function RefreshIndicator({ 
  isLoading, 
  onRefresh, 
  refreshInterval 
}: RefreshIndicatorProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={isLoading}
      className="text-blue-600 hover:text-blue-800 disabled:opacity-50 p-1 rounded-full hover:bg-blue-50 transition-colors"
      title="Refresh orders"
    >
      <svg 
        className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
    </button>
  );
}
