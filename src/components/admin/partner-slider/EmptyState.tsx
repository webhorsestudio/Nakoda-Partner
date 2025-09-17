import React from 'react';
import { PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  onAddNew?: () => void;
}

export function EmptyState({ onAddNew }: EmptyStateProps) {
  return (
    <li className="px-4 py-5 sm:px-6">
      <div className="text-center py-8">
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No images</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new promotional image.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Image
          </button>
        </div>
      </div>
    </li>
  );
}
