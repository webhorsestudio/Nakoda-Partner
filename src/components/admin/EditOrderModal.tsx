"use client";

import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SearchablePartnerDropdown } from '@/components/admin/SearchablePartnerDropdown';
import { usePartnerAssignment } from '@/hooks/usePartnerAssignment';
import { extractPaymentMode, calculateBalanceAmount } from '@/utils/paymentModeExtractor';
import { AdminOrder } from '@/types/orders';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrder | null;
  onOrderUpdated: () => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onOrderUpdated
}) => {
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  const {
    partners,
    selectedPartner,
    loadingPartners,
    assigningPartner,
    fetchPartners,
    selectPartner,
    assignPartnerToOrder,
    clearAssignmentState
  } = usePartnerAssignment();

  // Load partners when modal opens
  useEffect(() => {
    if (isOpen && order) {
      fetchPartners();
      clearAssignmentState();
      setAssignmentError(null);
      setAssignmentSuccess(false);
    }
  }, [isOpen, order, fetchPartners, clearAssignmentState]);

  const handleAssignPartner = async () => {
    if (!order || !selectedPartner) return;

    setAssignmentError(null);
    setAssignmentSuccess(false);

    try {
      // Create order details object for assignment
      
      const orderDetails = {
        id: order.id,
        orderNumber: order.orderNumber,
        title: order.title || `${order.serviceType} - ${order.orderNumber}`, // Use actual order title from database
        amount: order.amount,
        customerName: order.customerName,
        customerPhone: order.mobileNumber,
        address: order.address || order.city, // Use full address if available
        city: order.city,
        pinCode: order.pinCode || '', // Use actual pin code
        serviceDate: order.serviceDate,
        timeSlot: order.timeSlot || '', // Use actual time slot from order
        package: order.serviceType,
        partner: order.partner,
        status: order.status,
        commission: '10', // Default commission
        advanceAmount: order.advanceAmount || Math.round(order.amount * 0.1), // Use actual advance amount
        vendorAmount: order.vendorAmount || '', // Use actual vendor amount
        taxesAndFees: order.taxesAndFees || '0', // Use actual taxes and fees
        serviceType: order.serviceType,
        mode: 'online',
        specification: order.serviceType,
        currency: 'INR', // Default currency
        bitrix24Id: order.id, // Use order ID as bitrix24Id for assignment
        stageId: '1'
      };


      const success = await assignPartnerToOrder(orderDetails);
      
      if (success) {
        setAssignmentSuccess(true);
        setTimeout(() => {
          onOrderUpdated();
          handleClose();
        }, 2000);
      } else {
        setAssignmentError('Failed to assign partner. Please try again.');
      }
    } catch (error) {
      console.error('Error assigning partner:', error);
      setAssignmentError('An error occurred while assigning the partner.');
    }
  };

  const handleClose = () => {
    onClose();
    clearAssignmentState();
    setAssignmentError(null);
    setAssignmentSuccess(false);
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Partner</h2>
            <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
          </div>
          <Button onClick={handleClose} variant="ghost" size="icon" className="h-8 w-8">
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Customer:</span>
                <p className="text-gray-900">{order.customerName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Service:</span>
                <p className="text-gray-900">{order.serviceType}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Full Address:</span>
                <p className="text-gray-900">{order.address || order.city}</p>
                {order.pinCode && <p className="text-gray-600 text-xs">PIN: {order.pinCode}</p>}
              </div>
              <div>
                <span className="font-medium text-gray-700">Payment Mode:</span>
                <p className="text-gray-900 font-medium">
                  {extractPaymentMode(order.title) === 'COD' ? 'Cash on Delivery' : 
                   extractPaymentMode(order.title) === 'online' ? 'Online Payment' : 'Unknown'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Amount:</span>
                <p className="text-gray-900 font-semibold">₹{order.amount.toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Advance Amount:</span>
                <p className="text-gray-900">₹{(order.advanceAmount || 0).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Balance Amount:</span>
                <p className="font-semibold text-green-600">
                  ₹{calculateBalanceAmount(order.amount, order.advanceAmount || 0, extractPaymentMode(order.title), order.vendorAmount).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Service Date:</span>
                <p className="text-gray-900">{order.serviceDate ? new Date(order.serviceDate).toLocaleDateString() : 'Not set'}</p>
              </div>
            </div>
          </Card>

          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700">Current Status:</span>
                <p className={`text-sm font-semibold ${
                  order.partner === 'Ready to Assign' 
                    ? 'text-orange-600' 
                    : 'text-gray-900'
                }`}>
                  {order.partner}
                </p>
              </div>
            </div>
            {order.partner === 'Ready to Assign' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                Needs Assignment
              </span>
            )}
          </div>

          {/* Partner Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Partner</h3>
            
            {loadingPartners ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading partners...</span>
              </div>
            ) : (
              <SearchablePartnerDropdown
                partners={partners}
                selectedPartner={selectedPartner}
                onPartnerSelect={selectPartner}
                placeholder="Search and select a partner..."
              />
            )}

            {selectedPartner && (() => {
              const partner = partners.find(p => p.id === selectedPartner);
              return partner ? (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Selected Partner</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">Name:</span>
                      <p className="text-blue-900">{partner.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">City:</span>
                      <p className="text-blue-900">{partner.city}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Service Type:</span>
                      <p className="text-blue-900">{partner.service_type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Wallet Balance:</span>
                      <p className="text-blue-900">₹{partner.wallet_balance?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </Card>
              ) : null;
            })()}
          </div>

          {/* Error Display */}
          {(assignmentError || assigningPartner) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-red-100 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-red-800">
                  {assignmentError || 'Assigning partner...'}
                </span>
              </div>
            </div>
          )}

          {/* Success Display */}
          {assignmentSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-green-100 rounded-lg">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-800">
                  Partner assigned successfully! Closing modal...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleAssignPartner}
            disabled={!selectedPartner || assigningPartner}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            {assigningPartner ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Assigning...
              </>
            ) : (
              'Assign Partner'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
