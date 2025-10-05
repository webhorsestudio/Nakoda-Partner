"use client";

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { OrderDetailsDisplay } from './OrderDetailsDisplay';
import { useOrderDetails } from '@/hooks/useOrderDetails';
import { useAddToDatabase } from '@/hooks/useAddToDatabase';
import { formatDateOnly } from '@/utils/orders';
import { formatServiceDateTime } from '@/utils/timeSlots';
import { notificationService } from '@/services/notificationService';


interface AddNewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export const AddNewOrderModal: React.FC<AddNewOrderModalProps> = ({
  isOpen,
  onClose
}) => {
  const [orderNumberInput, setOrderNumberInput] = useState('');

  // Custom hooks for business logic
  const {
    fetchedOrderDetails,
    fetchingOrder,
    fetchError,
    fetchOrderFromBitrix24,
    clearOrderDetails
  } = useOrderDetails();

  const {
    addingToDatabase,
    addToDatabaseError,
    addOrderToDatabase,
    clearAddToDatabaseState
  } = useAddToDatabase();

  // Handle order fetching
  const handleFetchOrder = async () => {
    if (!orderNumberInput.trim()) return;
    
    await fetchOrderFromBitrix24(orderNumberInput);
  };

  // Handle adding order to database
  const handleAddToDatabase = async () => {
    if (!fetchedOrderDetails) return;
    
    const success = await addOrderToDatabase(fetchedOrderDetails);
    if (success) {
      notificationService.success('Order successfully added to database! It can be assigned to a partner later.');
      
      // Close modal and refresh page to show the new order
      handleClose();
      
      // Refresh the page after a short delay to ensure the toast is visible
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    // Note: Error state is automatically displayed in the error section above
  };

  // Handle modal close
  const handleClose = () => {
    onClose();
    // Reset all state
    setOrderNumberInput('');
    clearOrderDetails();
    clearAddToDatabaseState();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New Order</h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Order Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Number
            </label>
            <input
              type="text"
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value)}
              placeholder="Enter Order Number (e.g., Nus104161, MNus101038)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the order number to fetch order details from Bitrix24
            </p>
            <p className="mt-1 text-xs text-blue-600">
              💡 Tip: Try searching for recent orders like Nus104161, MNus101038, Nus87638, etc.
            </p>
          </div>

          {/* Fetch Button */}
          <Button
            onClick={handleFetchOrder}
            disabled={fetchingOrder || !orderNumberInput.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {fetchingOrder ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Fetching Order Details...
              </>
            ) : (
              'Fetch Order Details'
            )}
          </Button>

          {/* Error Display */}
          {(fetchError || addToDatabaseError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-red-100 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-red-800">
                  {fetchError || addToDatabaseError}
                </span>
              </div>
            </div>
          )}

          {/* Order Details Display */}
          {fetchedOrderDetails && (
            <OrderDetailsDisplay
              orderDetails={fetchedOrderDetails}
              formatDateOnly={(date: string | null) => date ? formatDateOnly(date) : 'N/A'}
              formatServiceDateTime={formatServiceDateTime}
            />
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {/* Add to Database Button - Always show when order is fetched */}
            {fetchedOrderDetails && (
              <Button
                onClick={handleAddToDatabase}
                disabled={addingToDatabase}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {addingToDatabase ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding to Database...
                  </>
                ) : (
                  'Add to Database'
                )}
              </Button>
            )}
            
            {/* Cancel Button */}
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
