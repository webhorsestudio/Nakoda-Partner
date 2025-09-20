import React from 'react';
import { CardFooter } from '@/components/ui/card';
import { OngoingTask } from '../../types';
import OngoingTaskActions from '../OngoingTaskActions';

interface OngoingTaskCardFooterProps {
  task: OngoingTask;
  onViewDetails: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export default function OngoingTaskCardFooter({ 
  task, 
  onViewDetails, 
  onCompleteTask 
}: OngoingTaskCardFooterProps) {
  return (
    <CardFooter className="pt-0">
      <OngoingTaskActions
        taskId={task.id}
        status={task.status}
        onViewDetails={onViewDetails}
        onCompleteTask={onCompleteTask}
        customerPhone={task.customerPhone}
        isCompleted={task.isCompleted}
        isExpired={task.isExpired}
      />
    </CardFooter>
  );
}
