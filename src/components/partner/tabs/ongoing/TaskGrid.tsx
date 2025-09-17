import React from 'react';
import { OngoingTask } from './types';
import OngoingTaskCard from './OngoingTaskCard';
import EmptyState from './EmptyState';

interface TaskGridProps {
  tasks: OngoingTask[];
  onViewDetails: (taskId: string) => void;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  className?: string;
}

export default function TaskGrid({ 
  tasks, 
  onViewDetails, 
  onStartTask, 
  onCompleteTask,
  className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
}: TaskGridProps) {
  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={className}>
      {tasks.map((task) => (
        <OngoingTaskCard
          key={task.id}
          task={task}
          onViewDetails={onViewDetails}
          onStartTask={onStartTask}
          onCompleteTask={onCompleteTask}
        />
      ))}
    </div>
  );
}
