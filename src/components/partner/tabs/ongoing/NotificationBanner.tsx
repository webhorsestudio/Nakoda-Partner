import React from 'react';

interface NotificationBannerProps {
  show: boolean;
  count: number;
  onDismiss: () => void;
  className?: string;
}

export default function NotificationBanner({ 
  show, 
  count, 
  onDismiss, 
  className = "space-y-6" 
}: NotificationBannerProps) {
  if (!show) return null;

  return (
    <div className={className}>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-green-800">
              {count} new order{count > 1 ? 's' : ''} assigned to you!
            </span>
            <div className="text-xs text-green-600 mt-1">
              Auto-updated just now
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
            title="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
