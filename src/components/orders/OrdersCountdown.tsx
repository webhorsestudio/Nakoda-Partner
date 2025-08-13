import { ClockIcon, ArrowPathIcon, PlayIcon, PauseIcon, BellIcon } from '@heroicons/react/24/outline';
import { useAutoFetch } from '@/contexts/AutoFetchContext';
import { useState, useEffect } from 'react';

interface OrdersCountdownProps {
  onManualFetch: () => Promise<void>;
}

export default function OrdersCountdown({
  onManualFetch,
}: OrdersCountdownProps) {
  // Use the global auto-fetch context
  const {
    countdown,
    isFetching,
    lastFetchTime,
    isAutoFetchEnabled,
    toggleAutoFetch,
    requestNotifications,
  } = useAutoFetch();

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showNotificationButton, setShowNotificationButton] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      setShowNotificationButton(Notification.permission === 'default');
    }
  }, []);

  const handleRequestNotifications = async () => {
    const granted = await requestNotifications();
    if (granted) {
      setNotificationPermission('granted');
      setShowNotificationButton(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLastFetchTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ClockIcon className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              {isAutoFetchEnabled ? (
                <>
                  Next Data Fetch in{' '}
                  <span className="font-bold text-lg">{formatTime(countdown)}</span>
                  {' '}(5 minutes)
                </>
              ) : (
                <span className="text-blue-700">Auto-fetch is disabled</span>
              )}
            </p>
            {lastFetchTime && (
              <p className="text-xs text-blue-700">
                Last fetch: {formatLastFetchTime(lastFetchTime)}
              </p>
            )}
            {/* Background service status */}
            <p className="text-xs text-blue-600 mt-1">
              {isAutoFetchEnabled ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Background sync active
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  Background sync inactive
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Notification permission button */}
          {showNotificationButton && (
            <button
              onClick={handleRequestNotifications}
              className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm leading-4 font-medium rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
            >
              <BellIcon className="h-4 w-4 mr-2" />
              Enable Notifications
            </button>
          )}

          {/* Auto-fetch toggle button */}
          <button
            onClick={toggleAutoFetch}
            disabled={isFetching}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md ${
              isAutoFetchEnabled
                ? 'bg-green-600 text-white hover:bg-green-700 border-green-600'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
          >
            {isAutoFetchEnabled ? (
              <>
                <PauseIcon className="h-4 w-4 mr-2" />
                Disable Auto
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Enable Auto
              </>
            )}
          </button>

          {/* Manual fetch button */}
          <button
            onClick={onManualFetch}
            disabled={isFetching}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
              isFetching
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            } transition-colors duration-200`}
          >
            <ArrowPathIcon 
              className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} 
            />
            {isFetching ? 'Fetching...' : 'Fetch Now'}
          </button>
        </div>
      </div>
      
      {isFetching && (
        <div className="mt-3">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}

      {/* Background service info */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <div className="flex items-center justify-between text-xs text-blue-600">
          <span>
            Background service: {isAutoFetchEnabled ? 'Running' : 'Stopped'}
          </span>
          <span>
            Notifications: {notificationPermission === 'granted' ? 'Enabled' : notificationPermission === 'denied' ? 'Blocked' : 'Not requested'}
          </span>
        </div>
      </div>
    </div>
  );
}
