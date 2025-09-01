import React from 'react';
import { ClockIcon } from 'lucide-react';
import { OrderDetailsHeaderProps } from './types';

export default function OrderDetailsHeader({ order, onClose }: OrderDetailsHeaderProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl font-bold text-slate-900">{order.title}</h1>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span>Order #{order.orderNumber}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>₹{order.totalAmount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{order.estimatedDuration}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
