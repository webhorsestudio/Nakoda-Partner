import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '',
  message = 'Loading...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  return (
    <div 
      className={`min-h-screen bg-white flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center space-y-4">
        <div 
          className={`animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 ${sizeClasses[size]}`}
          aria-hidden="true"
        ></div>
        <div className="sr-only">{message}</div>
        <p className="text-slate-600 text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
