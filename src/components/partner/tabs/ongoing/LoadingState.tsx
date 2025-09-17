import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({ 
  message = "Loading your orders...", 
  className = "space-y-6" 
}: LoadingStateProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">{message}</p>
        </div>
      </div>
    </div>
  );
}
