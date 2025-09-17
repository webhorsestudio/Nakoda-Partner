import React from 'react';
import { FilterField } from './FilterField';

interface NumberFilterProps {
  label: string;
  id: string;
  value: number | '';
  onChange: (value: number | '') => void;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
  step?: number;
}

export function NumberFilter({ 
  label, 
  id, 
  value, 
  onChange, 
  disabled = false,
  placeholder,
  min = 0,
  step = 0.01
}: NumberFilterProps) {
  return (
    <FilterField label={label} id={id}>
      <div className="relative">
        <input
          type="number"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : '')}
          placeholder={placeholder}
          min={min}
          step={step}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
          disabled={disabled}
        />
        {label.includes('₹') && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500 text-sm font-medium">₹</span>
          </div>
        )}
      </div>
    </FilterField>
  );
}
