'use client';

import React from 'react';
import { useGlobalOrderService } from '@/hooks/useGlobalOrderService';

export default function GlobalOrderIndicator() {
  const { orders, isLoading, total, partner } = useGlobalOrderService();

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-50">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
        <span>
          {isLoading ? 'Updating...' : `${total} orders`}
        </span>
        {partner && (
          <span className="text-xs opacity-75">
            ({partner.name})
          </span>
        )}
      </div>
    </div>
  );
}
