import React from 'react';
import { PartnerWithAssignedOrders } from '@/hooks/useAssignedOrders';
import { 
  formatCurrency, 
  getOrderStatusColor 
} from './utils/formatters';

interface AssignedOrdersSummaryProps {
  partner: PartnerWithAssignedOrders;
}

export default function AssignedOrdersSummary({ partner }: AssignedOrdersSummaryProps) {
  return (
    <div>
      <h4 className="text-md font-semibold text-gray-900 mb-3">Assigned Orders Summary</h4>
      <div className="space-y-2">
        <div><span className="font-medium">Assigned Orders Count:</span> {partner.assignedOrdersCount}</div>
        <div><span className="font-medium">Total Assigned Amount:</span> {formatCurrency(partner.totalAssignedAmount)}</div>
        <div><span className="font-medium">Average Order Value:</span> {partner.assignedOrdersCount > 0 ? formatCurrency(partner.totalAssignedAmount / partner.assignedOrdersCount) : 'N/A'}</div>
      </div>
      
      <div className="mt-4">
        <h5 className="text-sm font-semibold text-gray-900 mb-2">Status Breakdown</h5>
        <div className="space-y-1">
          {Object.entries(partner.statusBreakdown).map(([status, count]) => (
            <div key={status} className="flex justify-between items-center text-sm">
              <span className={`px-2 py-1 rounded-full ${getOrderStatusColor(status)}`}>
                {status}
              </span>
              <span className="font-medium">{count} orders</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
