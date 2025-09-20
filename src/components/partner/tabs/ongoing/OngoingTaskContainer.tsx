import React, { useState, useEffect, useMemo } from 'react';
import { usePartnerAcceptedOrders } from '@/hooks/usePartnerAcceptedOrders';
import { useTaskFiltering } from '@/hooks/useTaskFiltering';
import { useTaskStatistics } from '@/hooks/useTaskStatistics';
import { useTaskActions } from '@/hooks/useTaskActions';
import OngoingTaskPresentation from './OngoingTaskPresentation';
import { toast } from 'react-hot-toast';

export default function OngoingTaskContainer() {
  // State to track completed tasks
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  // State to track expired tasks
  const [expiredTaskIds, setExpiredTaskIds] = useState<Set<string>>(new Set());

  // Data fetching
  const {
    orders,
    isLoading,
    error,
    total,
    refreshOrders,
    hasNewOrders,
    newOrdersCount,
    dismissNewOrdersNotification
  } = usePartnerAcceptedOrders();

  // Add completion and expiration state to tasks first - memoized to prevent unnecessary re-renders
  const tasksWithCompletionState = useMemo(() => {
    return orders.map(task => ({
      ...task,
      isCompleted: completedTaskIds.has(task.id),
      isExpired: expiredTaskIds.has(task.id)
    }));
  }, [orders, completedTaskIds, expiredTaskIds]);
  
  // Track completion state changes
  useEffect(() => {
    // Completion state updated
  }, [completedTaskIds]);

  // Business logic hooks - use tasks with completion state
  const {
    selectedFilter,
    filteredTasks,
    setSelectedFilter,
    availableFilters
  } = useTaskFiltering({ tasks: tasksWithCompletionState });

  const statistics = useTaskStatistics({ tasks: tasksWithCompletionState });
  const { handleViewDetails, handleCompleteTask } = useTaskActions();

  // Handle task completion
  const handleTaskCompleted = (taskId: string) => {
    // Mark task as completed in local state
    setCompletedTaskIds(prev => {
      const newSet = new Set([...prev, taskId]);
      return newSet;
    });
    
    // Show notification that order will be removed from ongoing list
    toast.success('Order completed! Removing from ongoing tasks...', {
      duration: 3000,
      icon: '✅',
    });
    
    // Refresh the orders list to remove the completed order
    // Add a small delay to ensure database update has been processed
    setTimeout(() => {
      refreshOrders();
    }, 1000); // 1 second delay
    
    // Note: API call is handled in CountdownTimer component
    // This function is called after successful API completion
  };

  // Handle task expiration
  const handleTaskExpired = (taskId: string) => {
    // Mark task as expired in local state
    setExpiredTaskIds(prev => {
      const newSet = new Set([...prev, taskId]);
      return newSet;
    });
  };


  return (
    <OngoingTaskPresentation
      // Data
      orders={tasksWithCompletionState}
      filteredTasks={filteredTasks}
      isLoading={isLoading}
      error={error}
      total={total}
      
      // Statistics
      statistics={statistics}
      
      // Filtering
      selectedFilter={selectedFilter}
      availableFilters={availableFilters}
      onFilterChange={setSelectedFilter}
      
      // Notifications
      hasNewOrders={hasNewOrders}
      newOrdersCount={newOrdersCount}
      onDismissNotification={dismissNewOrdersNotification}
      
      // Actions
      onRefresh={refreshOrders}
      onViewDetails={handleViewDetails}
      onCompleteTask={handleCompleteTask}
      onTaskCompleted={handleTaskCompleted}
      onTaskExpired={handleTaskExpired}
    />
  );
}
