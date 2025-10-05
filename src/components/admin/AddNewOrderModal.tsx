"use client";

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { SearchablePartnerDropdown } from './SearchablePartnerDropdown';
import { OrderDetailsDisplay } from './OrderDetailsDisplay';
import { useOrderDetails } from '@/hooks/useOrderDetails';
import { usePartnerAssignment } from '@/hooks/usePartnerAssignment';
import { useAddToDatabase } from '@/hooks/useAddToDatabase';
import { formatDateOnly } from '@/utils/orders';
import { formatServiceDateTime } from '@/utils/timeSlots';


interface AddNewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderAssigned: () => void;
}

interface Bitrix24OrderDetails {
  id: string;
  orderNumber: string;
  title: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  pinCode: string;
  serviceDate: string;
  timeSlot: string;
  package: string;
  partner: string;
  status: string;
  commission: string;
  advanceAmount: number;
  taxesAndFees: string;
  serviceType: string;
  mode: string;
  specification: string;
  currency: string;
  bitrix24Id: string;
  stageId: string;
}

export const AddNewOrderModal: React.FC<AddNewOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderAssigned
}) => {
  const [bitrixIdInput, setBitrixIdInput] = useState('');

  // Custom hooks for business logic
  const {
    fetchedOrderDetails,
    fetchingOrder,
    fetchError,
    fetchOrderFromBitrix24,
    clearOrderDetails
  } = useOrderDetails();

  const {
    partners,
    selectedPartner,
    loadingPartners,
    assigningPartner,
    assignmentError,
    fetchPartners,
    selectPartner,
    assignPartnerToOrder,
    clearAssignmentState
  } = usePartnerAssignment();

  const {
    addingToDatabase,
    addToDatabaseError,
    addOrderToDatabase,
    clearAddToDatabaseState
  } = useAddToDatabase();

  // Handle order fetching
  const handleFetchOrder = async () => {
    if (!bitrixIdInput.trim()) return;
    
    await fetchOrderFromBitrix24(bitrixIdInput);
    
    // Auto-fetch partners when order is fetched successfully
    if (!fetchError && !fetchingOrder) {
      await fetchPartners();
    }
  };

  // Handle adding order to database
  const handleAddToDatabase = async () => {
    if (!fetchedOrderDetails) return;
    
    const success = await addOrderToDatabase(fetchedOrderDetails);
    if (success) {
      onOrderAssigned(); // Refresh the orders list to show the new order
      alert('Order successfully added to database! It can be assigned to a partner later.');
    }
    // Note: Error state is automatically displayed in the error section above
  };

  // Handle partner assignment
  const handleAssignPartner = async () => {
    if (!fetchedOrderDetails) return;
    
    const success = await assignPartnerToOrder(fetchedOrderDetails);
    if (success) {
      onOrderAssigned();
      handleClose();
      alert('Order successfully assigned to partner!');
    }
  };

  // Handle modal close
  const handleClose = () => {
    onClose();
    // Reset all state
    setBitrixIdInput('');
    clearOrderDetails();
    clearAssignmentState();
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
          {/* Bitrix ID Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bitrix ID
            </label>
            <input
              type="text"
              value={bitrixIdInput}
              onChange={(e) => setBitrixIdInput(e.target.value)}
              placeholder="Enter Bitrix ID (e.g., 12345)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the Bitrix24 deal ID to fetch order details
            </p>
            <p className="mt-1 text-xs text-blue-600">
              💡 Tip: Try searching for recent deals with IDs like 654976, 654974, 654972, etc. Check the terminal logs for valid deal IDs with populated data.
            </p>
          </div>

          {/* Fetch Button */}
          <Button
            onClick={handleFetchOrder}
            disabled={fetchingOrder || !bitrixIdInput.trim()}
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
          {(fetchError || assignmentError || addToDatabaseError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-red-100 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-red-800">
                  {fetchError || assignmentError || addToDatabaseError}
                </span>
              </div>
            </div>
          )}

          {/* Order Details Display */}
          {fetchedOrderDetails && (
            <>
              <OrderDetailsDisplay
                orderDetails={fetchedOrderDetails}
                formatDateOnly={(date: string | null) => date ? formatDateOnly(date) : 'N/A'}
                formatServiceDateTime={formatServiceDateTime}
              />

              {/* Partner Assignment Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Assign to Partner</h4>
                
                <SearchablePartnerDropdown
                  partners={partners}
                  selectedPartner={selectedPartner}
                  onPartnerSelect={selectPartner}
                  loading={loadingPartners}
                />
                
                {assigningPartner && (
                  <div className="text-sm text-blue-600 mt-3">Assigning partner to order...</div>
                )}
              </div>
            </>
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
            
            {/* Partner Assignment Section */}
            <div className="flex gap-3">
              {fetchedOrderDetails && !assigningPartner && (
                <Button
                  onClick={handleAssignPartner}
                  disabled={!selectedPartner}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Assign Partner
                </Button>
              )}
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
