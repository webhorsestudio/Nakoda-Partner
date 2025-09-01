import React from 'react';
import { Badge } from '@/components/ui/badge';
import { OngoingTaskFiltersProps } from './types';

const availableFilters = [
  { id: 'all', label: 'All Tasks' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' }
];

export default function TaskFilters({ selectedFilter, onFilterChange }: OngoingTaskFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {availableFilters.map((filter) => (
        <Badge
          key={filter.id}
          variant={selectedFilter === filter.id ? "default" : "outline"}
          className={`cursor-pointer transition-colors ${
            selectedFilter === filter.id
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'hover:bg-blue-50'
          }`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </Badge>
      ))}
    </div>
  );
}
