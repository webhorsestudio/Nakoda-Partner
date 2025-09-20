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
  onCompleteTask,
  onTaskExpired,
  onTaskCompleted
}: OngoingTaskCardProps) {
  const cardHandlers = useOngoingTaskCard({ 
    task, 
    onViewDetails, 
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
        onCompleteTask={onCompleteTask}
      />
    </Card>
  );
}
