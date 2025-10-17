import React, { useState } from 'react';
import { AssignedOrderDetail } from '@/hooks/useAssignedOrders';
import { 
  formatCurrency, 
  formatDate, 
  getOrderStatusColor 
} from './utils/formatters';

interface RecentAssignedOrdersProps {
  assignedOrders: AssignedOrderDetail[];
}

export default function RecentAssignedOrders({ assignedOrders }: RecentAssignedOrdersProps) {
  const [visibleOrdersCount, setVisibleOrdersCount] = useState(10);

  if (assignedOrders.length === 0) {
    return null;
  }

  const sortedOrders = assignedOrders
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());

  const visibleOrders = sortedOrders.slice(0, visibleOrdersCount);
  const remainingOrders = sortedOrders.length - visibleOrdersCount;

  const handleShowMore = () => {
    setVisibleOrdersCount(prev => Math.min(prev + 10, sortedOrders.length));
  };

  return (
    <div className="mt-6">
      <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Assigned Orders</h4>
      <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
        <div className="space-y-2">
          {visibleOrders.map((order, index) => (
            <div key={`${order.orderNumber}-${index}`} className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-mono">#{order.orderNumber}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <span>{formatCurrency(order.amount)}</span>
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(order.serviceDate)}
              </div>
            </div>
          ))}
          {remainingOrders > 0 && (
            <div className="text-xs text-gray-500 text-center pt-2">
              <button
                onClick={handleShowMore}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                ... and {remainingOrders} more orders
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
