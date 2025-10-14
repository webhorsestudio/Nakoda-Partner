import React from 'react';
import { OngoingTask } from '../../types';
import OngoingTaskCardHeader from '../OngoingTaskCardHeader';

interface OngoingTaskCardHeaderSectionProps {
  task: OngoingTask;
}

export default function OngoingTaskCardHeaderSection({ task }: OngoingTaskCardHeaderSectionProps) {
  return (
    <OngoingTaskCardHeader 
      title={task.title} 
      description={task.description || ''}
      package={task.package}
      orderNumber={task.orderNumber}
      status={task.status}
      currentPhase={task.currentPhase}
    />
  );
}
