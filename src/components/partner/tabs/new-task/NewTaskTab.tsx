import React, { useState, memo, useMemo, useRef, useEffect } from 'react';
import {
  NewTaskHeader,
  TaskFilters,
  TaskCard,
  EmptyState
} from './';
import { useGlobalOrderService } from '@/hooks/useGlobalOrderService';
import RefreshIndicator from './RefreshIndicator';

function NewTaskTab() {
  console.log('NewTaskTab component rendering');
  const [acceptedOrders, setAcceptedOrders] = useState<Set<string>>(new Set());
  const renderCountRef = useRef(0);
  const lastOrdersRef = useRef<string>('');
  const lastStateRef = useRef<Record<string, unknown> | null>(null);
  
  const {
    orders,
    isLoading,
    error,
    total,
    partner,
    refreshOrders,
    acceptOrder,
    isAccepting,
    hasNewOrders,
    newOrdersCount,
    dismissNewOrdersNotification
  } = useGlobalOrderService(); // Uses global service that runs independently

  // Check if state actually changed to prevent unnecessary re-renders
  const currentState = { orders, isLoading, error, total, partner, hasNewOrders, newOrdersCount };
  const stateChanged = JSON.stringify(lastStateRef.current) !== JSON.stringify(currentState);
  
  if (stateChanged) {
    lastStateRef.current = currentState;
  }

  // Track render count and prevent unnecessary re-renders
  useEffect(() => {
    renderCountRef.current += 1;
    const currentOrders = JSON.stringify(orders);
    const hasOrdersChanged = lastOrdersRef.current !== currentOrders;
    
    if (hasOrdersChanged) {
      lastOrdersRef.current = currentOrders;
      console.log(`🔄 NewTaskTab render count: ${renderCountRef.current} (orders changed)`);
    } else {
      console.log(`⏭️ NewTaskTab render count: ${renderCountRef.current} (no order changes)`);
    }
  });

  // Memoize the component props to prevent unnecessary re-renders
  const memoizedProps = useMemo(() => ({
    orders,
    isLoading,
    error,
    total,
    partner,
    refreshOrders,
    acceptOrder,
    isAccepting,
    hasNewOrders,
    newOrdersCount,
    dismissNewOrdersNotification
  }), [orders, isLoading, error, total, partner, refreshOrders, acceptOrder, isAccepting, hasNewOrders, newOrdersCount, dismissNewOrdersNotification]);

  // Debug logging
  console.log('NewTaskTab render:', {
    isLoading,
    error,
    ordersCount: orders.length,
    total,
    partner: partner?.name
  });

  // Memoize filtered orders to prevent unnecessary recalculations
  const availableOrders = useMemo(() => {
    return orders.filter(order => !acceptedOrders.has(order.id));
  }, [orders, acceptedOrders]);

  const handleAcceptTask = async (taskId: string) => {
    // Optimistically update UI
    setAcceptedOrders(prev => new Set(prev).add(taskId));
    
    try {
      await acceptOrder(taskId);
      // Success - keep the optimistic update
    } catch (error) {
      console.error('Error accepting task:', error);
      // Revert optimistic update
      setAcceptedOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleViewDetails = (taskId: string) => {
    window.location.href = `/partner/order/${taskId}`;
  };

  const handleRefresh = () => {
    refreshOrders();
  };

  // Debug: Show current state
  if (orders.length === 0 && !isLoading && !error) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium">Debug: No orders found</h3>
          <p className="text-yellow-700 text-sm">
            isLoading: {isLoading.toString()}, error: {error || 'none'}, orders: {orders.length}, total: {total}
          </p>
          <button 
            onClick={refreshOrders}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Orders
          </button>
        </div>
      </div>
    );
  }

  // Show loading state with skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        </div>

        {/* Partner Info Skeleton */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-blue-200 rounded w-40 animate-pulse"></div>
              <div className="h-3 bg-blue-100 rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-5 w-5 bg-blue-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Task Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
              {/* Task Title Skeleton */}
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
              </div>
              
              {/* Customer Info Skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse"></div>
              </div>
              
              {/* Amount Skeleton */}
              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
              
              {/* Buttons Skeleton */}
              <div className="flex space-x-2 pt-2">
                <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <NewTaskHeader totalTasks={0} />
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 mb-2">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Tasks</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // availableOrders is now memoized above

  return (
    <div className="space-y-6">
      <NewTaskHeader totalTasks={availableOrders.length} />
      
      {/* Partner Info */}
      {partner && (
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{partner.name}</h3>
              <p className="text-sm text-muted-foreground">
                {partner.city} • {partner.serviceType} • {availableOrders.length} available orders
              </p>
            </div>
            <RefreshIndicator
              isLoading={isLoading}
              onRefresh={handleRefresh}
              refreshInterval={10000}
            />
          </div>
        </div>
      )}

      {/* New Orders Notification */}
      {hasNewOrders && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-green-800">
                {newOrdersCount} new order{newOrdersCount > 1 ? 's' : ''} available!
              </span>
              <div className="text-xs text-green-600 mt-1">
                Auto-updated just now
              </div>
            </div>
            <button
              onClick={dismissNewOrdersNotification}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
              title="Dismiss notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <TaskFilters
        selectedFilter="all"
        onFilterChange={() => {}}
      />
      
      {availableOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {availableOrders.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onAcceptTask={handleAcceptTask}
              onViewDetails={handleViewDetails}
              isAccepting={isAccepting && acceptedOrders.has(task.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(NewTaskTab);