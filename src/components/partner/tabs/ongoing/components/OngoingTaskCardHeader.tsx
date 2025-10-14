import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { getCleanServiceTitle } from '../utils/titleUtils';

interface OngoingTaskCardHeaderProps {
  title: string;
  description: string;
  package?: string;
  orderNumber: string;
  status: 'in-progress' | 'completed' | 'cancelled' | 'assigned';
  currentPhase: string;
}

export default function OngoingTaskCardHeader({ 
  title, 
  description,
  package: packageField,
  orderNumber, 
  status, 
  currentPhase
}: OngoingTaskCardHeaderProps) {
  const cleanTitle = getCleanServiceTitle(description, packageField);
  
  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg line-clamp-2">
            {cleanTitle}
          </CardTitle>
        </div>
      </div>
    </CardHeader>
  );
}
