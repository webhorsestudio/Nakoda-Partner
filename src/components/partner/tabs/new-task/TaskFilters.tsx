import React from 'react';
import { TaskFiltersProps } from './types';

export default function TaskFilters({ selectedFilter, onFilterChange }: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Filter tabs removed - showing all tasks by default */}
    </div>
  );
}
