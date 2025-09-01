import React, { useState, useMemo } from 'react';
import {
  OngoingTaskHeader,
  TaskFilters,
  OngoingTaskCard,
  EmptyState,
  sampleOngoingTasks
} from './';

export default function OngoingTaskTab() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    if (selectedFilter === 'all') {
      return sampleOngoingTasks;
    }
    return sampleOngoingTasks.filter(task => task.status === selectedFilter);
  }, [selectedFilter]);

  const activeTasks = sampleOngoingTasks.filter(task => 
    task.status === 'in-progress'
  ).length;

  const completedToday = sampleOngoingTasks.filter(task => 
    task.status === 'completed'
  ).length;

  const handleViewDetails = (taskId: string) => {
    console.log('Viewing task details:', taskId);
    // Navigate to task details page
    window.location.href = `/partner/task/${taskId}`;
  };

  const handleStartTask = (taskId: string) => {
    console.log('Starting task:', taskId);
    // TODO: Implement start task logic
  };

  const handleCompleteTask = (taskId: string) => {
    console.log('Completing task:', taskId);
    // TODO: Implement complete task logic
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  return (
    <div className="space-y-6">
      <OngoingTaskHeader 
        totalTasks={sampleOngoingTasks.length}
        activeTasks={activeTasks}
        completedToday={completedToday}
      />
      
      <TaskFilters
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
      />
      
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <OngoingTaskCard
              key={task.id}
              task={task}
              onViewDetails={handleViewDetails}
              onStartTask={handleStartTask}
              onCompleteTask={handleCompleteTask}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
