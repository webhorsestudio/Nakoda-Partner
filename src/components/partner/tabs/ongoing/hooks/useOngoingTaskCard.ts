import { useCallback } from 'react';
import { OngoingTask } from '../types';

interface UseOngoingTaskCardProps {
  task: OngoingTask;
  onViewDetails: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export function useOngoingTaskCard({ 
  task, 
  onViewDetails, 
  onCompleteTask 
}: UseOngoingTaskCardProps) {
  
  const handleViewDetails = useCallback(() => {
    onViewDetails(task.id);
  }, [task.id, onViewDetails]);

  const handleCompleteTask = useCallback(() => {
    onCompleteTask(task.id);
  }, [task.id, onCompleteTask]);

  const handleCallNow = useCallback(() => {
    if (task.customerPhone) {
      window.open(`tel:${task.customerPhone}`, '_self');
    }
  }, [task.customerPhone]);

  return {
    handleViewDetails,
    handleCompleteTask,
    handleCallNow,
    // Task data
    taskId: task.id,
    status: task.status,
    customerPhone: task.customerPhone,
    // Task details
    title: task.title,
    description: task.description,
    orderNumber: task.orderNumber,
    currentPhase: task.currentPhase,
    // Customer info
    customerName: task.customerName,
    // Location info
    location: task.location,
    customerAddress: task.customerAddress,
    // Time info
    serviceDate: task.serviceDate,
    serviceTime: task.serviceTime,
    duration: task.duration,
    startTime: task.startTime,
    estimatedEndTime: task.estimatedEndTime,
    actualStartTime: task.actualStartTime,
    // Financial info
    amount: task.amount,
    advanceAmount: task.advanceAmount,
    balanceAmount: task.balanceAmount,
    commissionAmount: task.commissionAmount,
  };
}
