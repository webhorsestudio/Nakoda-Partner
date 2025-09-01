import React from 'react';
import { ZapIcon, ClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderActionsProps } from './types';

export default function OrderActions({ orderId, status, onAcceptOrder, onClose }: OrderActionsProps) {
  const isPending = status === 'pending';
  
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <ClockIcon className="w-4 h-4" />
          <span>Order #{orderId}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {isPending && (
            <Button
              onClick={() => onAcceptOrder(orderId)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              size="lg"
            >
              <ZapIcon className="w-4 h-4 mr-2" />
              Accept Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
