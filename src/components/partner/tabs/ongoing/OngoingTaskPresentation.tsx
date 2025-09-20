import React from 'react';
import { OngoingTask } from './types';
import { OngoingTaskHeader, TaskFilters } from './';
import OngoingTaskCard from './OngoingTaskCard';
import { useExpiredOrders } from './hooks/useExpiredOrders';

interface OngoingTaskPresentationProps {
  // Data
  orders: OngoingTask[];
  filteredTasks: OngoingTask[];
  isLoading: boolean;
  error: string | null;
  total: number;
  
  // Statistics
  statistics: {
    totalTasks: number;
    activeTasks: number;
    completedToday: number;
    assignedTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    cancelledTasks: number;
  };
  
  // Filtering
  selectedFilter: string;
  availableFilters: Array<{ id: string; label: string }>;
  onFilterChange: (filter: string) => void;
  
  // Notifications
  hasNewOrders: boolean;
  newOrdersCount: number;
  onDismissNotification: () => void;
  
  // Actions
  onRefresh: () => void;
  onViewDetails: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onTaskCompleted?: (taskId: string) => void;
  onTaskExpired?: (taskId: string) => void;
}

export default function OngoingTaskPresentation({
  orders,
  filteredTasks,
  isLoading,
  error,
  total,
  statistics,
  selectedFilter,
  availableFilters,
  onFilterChange,
  hasNewOrders,
  newOrdersCount,
  onDismissNotification,
  onRefresh,
  onViewDetails,
  onCompleteTask,
  onTaskCompleted,
  onTaskExpired
}: OngoingTaskPresentationProps) {
  // Handle expired orders - but don't filter them out, just track them
  const { 
    handleTaskExpired: handleExpiredFromHook
  } = useExpiredOrders({ 
    tasks: filteredTasks,
    onTaskExpired: (taskId) => {
      // Call the parent's onTaskExpired handler
      onTaskExpired?.(taskId);
    }
  });

  // Show all tasks (including expired ones with Task Completed button)
  const activeTasks = filteredTasks;
  
  // Show no orders available state
  if (activeTasks.length === 0 && !isLoading && !error) {
    return (
      <div className="space-y-6">
        <OngoingTaskHeader totalTasks={0} />
        
        {/* No Orders Available */}
        <div className="text-center py-12">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8">
            <div className="text-slate-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Ongoing Orders</h3>
            <p className="text-slate-600 mb-6">
                     You don&apos;t have any ongoing orders at the moment. Check back later or refresh to see if new orders have been assigned to you.
            </p>
            <button
              onClick={onRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Orders
            </button>
          </div>
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
        <OngoingTaskHeader totalTasks={0} />
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
              onClick={onRefresh}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OngoingTaskHeader totalTasks={activeTasks.length} />
      
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
              onClick={onDismissNotification}
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
        selectedFilter={selectedFilter}
        onFilterChange={onFilterChange}
        availableFilters={availableFilters}
      />
      
      {activeTasks.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeTasks.map((task) => (
              <OngoingTaskCard
                key={task.id}
                task={task}
                onViewDetails={onViewDetails}
                onCompleteTask={onCompleteTask}
                onTaskExpired={handleExpiredFromHook}
                onTaskCompleted={onTaskCompleted}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Ongoing Orders</h3>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
                   You don&apos;t have any ongoing orders at the moment. New orders will appear here when they are assigned to you.
          </p>
        </div>
      )}
    </div>
  );
}
