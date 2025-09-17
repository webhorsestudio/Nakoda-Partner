import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FilterHeaderProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  loading?: boolean;
}

export function FilterHeader({ 
  hasActiveFilters, 
  onClearFilters, 
  loading = false 
}: FilterHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <p className="text-sm text-gray-500">Refine your search results</p>
        </div>
      </div>
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <XMarkIcon className="w-4 h-4" />
          Clear All
        </button>
      )}
    </div>
  );
}
