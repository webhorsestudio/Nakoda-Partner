import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TaskStatusBadgeProps } from './types';

export default function TaskStatusBadge({ status, size = 'md' }: TaskStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'assigned':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Assigned'
        };
      case 'in-progress':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'In Progress'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Completed'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <Badge className={`${config.color} ${sizeClass} font-medium`}>
      {config.label}
    </Badge>
  );
}
