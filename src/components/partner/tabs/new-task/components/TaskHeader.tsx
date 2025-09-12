import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { getCleanServiceTitle } from '../utils/titleUtils';

interface TaskHeaderProps {
  title: string;
  description: string;
  partnerName?: string;
}

export default function TaskHeader({ title, description, partnerName }: TaskHeaderProps) {
  const cleanTitle = getCleanServiceTitle(description, partnerName);
  
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
