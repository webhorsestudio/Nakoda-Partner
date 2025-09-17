import React from 'react';
import { Card } from '@/components/ui/card';
import { OngoingTaskCardProps } from './types';
import { useOngoingTaskCard } from './hooks/useOngoingTaskCard';
import { CARD_STYLES } from './constants/cardConstants';
import { 
  OngoingTaskCardHeaderSection,
  OngoingTaskCardBody,
  OngoingTaskCardFooter
} from './components/sections';

export default function OngoingTaskCard({ 
  task, 
  onViewDetails, 
  onStartTask, 
  onCompleteTask,
  onTaskExpired,
  onTaskCompleted
}: OngoingTaskCardProps) {
  // Debug logging
  console.log(`OngoingTaskCard - Task ${task.id}:`, { 
    isCompleted: task.isCompleted, 
    status: task.status 
  });

  const cardHandlers = useOngoingTaskCard({ 
    task, 
    onViewDetails, 
    onStartTask, 
    onCompleteTask 
  });

  return (
    <Card className={CARD_STYLES.container}>
      <OngoingTaskCardHeaderSection task={task} />
      <OngoingTaskCardBody 
        task={task} 
        onTaskExpired={onTaskExpired}
        onTaskCompleted={onTaskCompleted}
      />
      <OngoingTaskCardFooter 
        task={task}
        onViewDetails={onViewDetails}
        onStartTask={onStartTask}
        onCompleteTask={onCompleteTask}
      />
    </Card>
  );
}
