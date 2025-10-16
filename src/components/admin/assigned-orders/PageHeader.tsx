import React from 'react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  loading: boolean;
  totalItems: number;
  totalAssignedOrders: number;
  currentPage: number;
  itemsPerPage: number;
  onRefresh: () => void;
}

export default function PageHeader({
  loading,
  totalItems,
  totalAssignedOrders,
  currentPage,
  itemsPerPage,
  onRefresh
}: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assigned Orders Details</h1>
            <p className="mt-1 text-sm text-gray-500">
              {loading ? 'Loading partners...' : `View all partners with their assigned order counts (${totalItems} partners, ${totalAssignedOrders} total assigned orders)`}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} partners
            </div>
            <Button onClick={onRefresh} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
