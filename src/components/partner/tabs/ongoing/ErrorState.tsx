import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({ 
  error, 
  onRetry, 
  className = "space-y-6" 
}: ErrorStateProps) {
  return (
    <div className={className}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-red-800">
              Error loading orders: {error}
            </span>
          </div>
          {onRetry && (
            <Button
              onClick={onRetry}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
