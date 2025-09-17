import React from 'react';

interface TableHeaderProps {
  totalItems: number;
}

export function TableHeader({ totalItems }: TableHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Partner Wallets ({totalItems})
        </h3>
      </div>
    </div>
  );
}
