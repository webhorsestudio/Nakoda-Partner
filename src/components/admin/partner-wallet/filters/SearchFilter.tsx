import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { FilterField } from './FilterField';

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function SearchFilter({ 
  value, 
  onChange, 
  disabled = false,
  placeholder = "Name, mobile, email..."
}: SearchFilterProps) {
  return (
    <FilterField label="Search" id="search">
      <div className="relative group">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
        <input
          type="text"
          id="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
          disabled={disabled}
        />
      </div>
    </FilterField>
  );
}
