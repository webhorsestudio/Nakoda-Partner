import React from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  searchTerm: string;
  dateFrom: string;
  dateTo: string;
}

export default function EmptyState({ searchTerm, dateFrom, dateTo }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Partners Found</h3>
      <p className="text-gray-500">
        {searchTerm || dateFrom || dateTo 
          ? 'Try adjusting your search criteria or date filters.'
          : 'There are currently no partners in the system.'
        }
      </p>
    </div>
  );
}
