import { useState, useCallback } from 'react';
import { OngoingTask } from '../types';

interface UseExpiredOrdersProps {
  tasks: OngoingTask[];
  onTaskExpired?: (taskId: string) => void;
}

export function useExpiredOrders({ tasks, onTaskExpired }: UseExpiredOrdersProps) {
  const [expiredTaskIds, setExpiredTaskIds] = useState<Set<string>>(new Set());

  const handleTaskExpired = useCallback((taskId: string) => {
    setExpiredTaskIds(prev => new Set([...prev, taskId]));
    onTaskExpired?.(taskId);
  }, [onTaskExpired]);

  const isTaskExpired = useCallback((taskId: string) => {
    return expiredTaskIds.has(taskId);
  }, [expiredTaskIds]);

  const checkTaskExpiration = useCallback((task: OngoingTask): boolean => {
    try {
      const serviceDateTime = new Date(`${task.serviceDate}T${task.serviceTime}`);
      const endDateTime = new Date(serviceDateTime.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration
      const now = new Date();
      
      return now > endDateTime;
    } catch (error) {
      console.error('Error checking task expiration:', error);
      return false;
    }
  }, []);

  const getActiveTasks = useCallback(() => {
    return tasks.filter(task => 
      !isTaskExpired(task.id) && 
      !checkTaskExpiration(task)
    );
  }, [tasks, isTaskExpired, checkTaskExpiration]);

  const getExpiredTasks = useCallback(() => {
    return tasks.filter(task => 
      isTaskExpired(task.id) || 
      checkTaskExpiration(task)
    );
  }, [tasks, isTaskExpired, checkTaskExpiration]);

  return {
    expiredTaskIds,
    handleTaskExpired,
    isTaskExpired,
    checkTaskExpiration,
    getActiveTasks,
    getExpiredTasks,
    clearExpiredTasks: () => setExpiredTaskIds(new Set())
  };
}
