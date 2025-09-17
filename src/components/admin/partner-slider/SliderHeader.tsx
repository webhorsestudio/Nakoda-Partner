import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface SliderHeaderProps {
  onAddNew?: () => void;
}

export function SliderHeader({ onAddNew }: SliderHeaderProps) {
  return (
    <div className="sm:flex sm:items-center">
      <div className="sm:flex-auto">
        <h1 className="text-2xl font-bold text-gray-900">Partner Slider Management</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage promotional images displayed on the partner dashboard slider
        </p>
      </div>
      <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          type="button"
          onClick={onAddNew}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Image
        </button>
      </div>
    </div>
  );
}
