import React from 'react';

interface FilterFieldProps {
  label: string;
  id: string;
  children: React.ReactNode;
}

export function FilterField({ label, id, children }: FilterFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}
