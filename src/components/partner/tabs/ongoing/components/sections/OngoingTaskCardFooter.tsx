import React from 'react';
import { CardFooter } from '@/components/ui/card';
import { OngoingTask } from '../../types';
import OngoingTaskActions from '../OngoingTaskActions';

interface OngoingTaskCardFooterProps {
  task: OngoingTask;
  onViewDetails: (taskId: string) => void;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export default function OngoingTaskCardFooter({ 
  task, 
  onViewDetails, 
  onStartTask, 
  onCompleteTask 
}: OngoingTaskCardFooterProps) {
  // Debug logging
  console.log(`OngoingTaskCardFooter - Task ${task.id}:`, { 
    isCompleted: task.isCompleted, 
    status: task.status 
  });

  return (
    <CardFooter className="pt-0">
      <OngoingTaskActions
        taskId={task.id}
        status={task.status}
        onViewDetails={onViewDetails}
        onStartTask={onStartTask}
        onCompleteTask={onCompleteTask}
        customerPhone={task.customerPhone}
        isCompleted={task.isCompleted}
      />
    </CardFooter>
  );
}
