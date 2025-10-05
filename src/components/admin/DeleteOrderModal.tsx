"use client";

import React, { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  city: string;
  serviceType: string;
  amount: number;
  status: string;
  partner: string;
}

interface DeleteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderDeleted: () => void;
}

export const DeleteOrderModal: React.FC<DeleteOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onOrderDeleted
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteOrder = async () => {
    if (!order) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/admin/orders/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ orderId: order.id })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onOrderDeleted();
        handleClose();
      } else {
        setDeleteError(result.error || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setDeleteError('An error occurred while deleting the order');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setDeleteError(null);
    setIsDeleting(false);
  };

  if (!isOpen || !order) return null;

  // Check if order is assigned to a partner
  const isAssigned = order.partner !== 'Ready to Assign';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Delete Order</h2>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          <Button onClick={handleClose} variant="ghost" size="icon" className="h-8 w-8">
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Warning</h3>
                <p className="text-sm text-red-700 mt-1">
                  {isAssigned 
                    ? `This order is assigned to ${order.partner}. Assigned orders cannot be deleted. Please unassign the order first if you need to remove it.`
                    : 'You are about to permanently delete this order. This action cannot be undone and will remove all associated data.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Order Number:</span>
                <span className="text-gray-900 font-mono">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Customer:</span>
                <span className="text-gray-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Service:</span>
                <span className="text-gray-900">{order.serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Amount:</span>
                <span className="text-gray-900 font-semibold">₹{order.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Partner:</span>
                <span className={`font-semibold ${
                  order.partner === 'Ready to Assign' 
                    ? 'text-orange-600' 
                    : 'text-gray-900'
                }`}>
                  {order.partner}
                </span>
              </div>
            </div>
          </Card>

          {/* Error Display */}
          {deleteError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-red-100 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-red-800">{deleteError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button onClick={handleClose} variant="outline" disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteOrder}
            disabled={isDeleting || isAssigned}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Order
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
