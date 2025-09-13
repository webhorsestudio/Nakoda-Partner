import React from 'react';
import { ZapIcon, ClockIcon, CheckCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderActionsProps } from './types';

export default function OrderActions({ orderId, status, onAcceptOrder, onClose, isAccepting = false }: OrderActionsProps) {
  const isPending = status === 'pending';
  const isAccepted = status === 'accepted';
  
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
              disabled={isAccepting}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              size="lg"
            >
              {isAccepting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Accepting...
                </>
              ) : (
                <>
                  <ZapIcon className="w-4 h-4 mr-2" />
                  Accept Order
                </>
              )}
            </Button>
          )}
          
          {isAccepted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-medium">Order Accepted</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
