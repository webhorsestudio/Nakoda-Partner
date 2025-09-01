import React, { useState, useMemo } from 'react';
import {
  NewTaskHeader,
  TaskFilters,
  TaskCard,
  EmptyState,
  sampleTasks
} from './new-task';

export default function NewTaskTab() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter tasks based on selected filter
  const filteredTasks = useMemo(() => {
    if (selectedFilter === 'all') {
      return sampleTasks;
    }
    return sampleTasks.filter(task => 
      task.serviceType.toLowerCase() === selectedFilter.toLowerCase()
    );
  }, [selectedFilter]);

  const handleAcceptTask = (taskId: string) => {
    console.log('Accepting task:', taskId);
    // TODO: Implement task acceptance logic
  };

  const handleViewDetails = (taskId: string) => {
    console.log('Viewing task details:', taskId);
    // TODO: Implement task details view
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <NewTaskHeader totalTasks={filteredTasks.length} />

      {/* Filters Section */}
      <TaskFilters 
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Tasks Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onAcceptTask={handleAcceptTask}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
