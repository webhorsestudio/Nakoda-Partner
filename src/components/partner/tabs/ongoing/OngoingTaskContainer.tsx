import React, { useState, useEffect, useMemo } from 'react';
import { usePartnerAcceptedOrders } from '@/hooks/usePartnerAcceptedOrders';
import { useTaskFiltering } from '@/hooks/useTaskFiltering';
import { useTaskStatistics } from '@/hooks/useTaskStatistics';
import { useTaskActions } from '@/hooks/useTaskActions';
import OngoingTaskPresentation from './OngoingTaskPresentation';

export default function OngoingTaskContainer() {
  // State to track completed tasks
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

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

  // Add completion state to tasks first - memoized to prevent unnecessary re-renders
  const tasksWithCompletionState = useMemo(() => {
    return orders.map(task => ({
      ...task,
      isCompleted: completedTaskIds.has(task.id)
    }));
  }, [orders, completedTaskIds]);
  
  // Debug logging
  console.log('Completed task IDs:', Array.from(completedTaskIds));
  console.log('Tasks with completion state:', tasksWithCompletionState.map(t => ({ id: t.id, isCompleted: t.isCompleted })));
  
  // Track completion state changes
  useEffect(() => {
    console.log('Completion state changed:', Array.from(completedTaskIds));
  }, [completedTaskIds]);

  // Business logic hooks - use tasks with completion state
  const {
    selectedFilter,
    filteredTasks,
    setSelectedFilter,
    availableFilters
  } = useTaskFiltering({ tasks: tasksWithCompletionState });

  const statistics = useTaskStatistics({ tasks: tasksWithCompletionState });
  const { handleViewDetails, handleStartTask, handleCompleteTask } = useTaskActions();

  // Handle task completion
  const handleTaskCompleted = (taskId: string) => {
    console.log('Task completed:', taskId);
    // Mark task as completed in local state
    setCompletedTaskIds(prev => {
      const newSet = new Set([...prev, taskId]);
      console.log('Updated completed task IDs:', Array.from(newSet));
      return newSet;
    });
    // TODO: Implement API call to mark task as completed
    // For now, just show a success message
    alert('Task marked as completed!');
  };

  // Test function to manually complete a task (for debugging)
  const testCompleteTask = (taskId: string) => {
    console.log('Test completing task:', taskId);
    setCompletedTaskIds(prev => new Set([...prev, taskId]));
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
      onStartTask={handleStartTask}
      onCompleteTask={handleCompleteTask}
      onTaskCompleted={handleTaskCompleted}
      onTestComplete={testCompleteTask}
    />
  );
}
