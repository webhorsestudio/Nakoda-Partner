"use client";

import React from 'react';

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

interface OrderDetailsDisplayProps {
  orderDetails: Bitrix24OrderDetails;
  formatDateOnly: (date: string | null) => string;
  formatServiceDateTime: (timeSlot: string | null, serviceDate: string | null) => string | null;
}

export const OrderDetailsDisplay: React.FC<OrderDetailsDisplayProps> = ({
  orderDetails,
  formatDateOnly,
  formatServiceDateTime
}) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-1 bg-green-100 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-sm font-semibold text-green-800">
          Order Found Successfully!
        </span>
      </div>

      {/* Comprehensive Order Details Grid */}
      <div className="space-y-4">
        {/* Order Information */}
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-gray-900 mb-3 text-sm">Order Information</h4>
          <div className="space-y-2 text-xs">
            <p className="text-gray-600">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium ml-1">{orderDetails.orderNumber}</span>
            </p>
            <p className="text-gray-600">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium ml-1 text-green-600">
                ₹{orderDetails.amount.toLocaleString()}
              </span>
            </p>
            <p className="text-gray-600">
              <span className="text-gray-600">Taxes and Fee:</span>
              <span className="font-medium ml-1">₹{orderDetails.taxesAndFees}</span>
            </p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-gray-900 mb-3 text-sm">Customer Information</h4>
          <div className="space-y-2 text-xs">
            <p className="text-gray-600">
              <span className="text-gray-600">Customer Name:</span>
              <span className="font-medium ml-1">{orderDetails.customerName}</span>
            </p>
            <p className="text-gray-600">
              <span className="text-gray-600">Mobile Number:</span>
              <span className="font-medium ml-1">{orderDetails.customerPhone}</span>
            </p>
            <p className="text-gray-600">
              <span className="text-gray-600">Address:</span>
              <span className="font-medium ml-1">{orderDetails.address}</span>
            </p>
            <p className="text-gray-600">
              <span className="text-gray-600">City:</span>
              <span className="font-medium ml-1">{orderDetails.city}</span>
            </p>
            <p className="text-gray-600">
              <span className="text-gray-600">Pin Code:</span>
              <span className="font-medium ml-1">{orderDetails.pinCode}</span>
            </p>
          </div>
        </div>

        {/* Partner Information */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3 text-sm">Partner Information</h4>
          <div className="space-y-2 text-xs">
            <p className="text-gray-600">
              <span className="text-gray-600">Service Package:</span>
              <span className="font-medium ml-1">{orderDetails.package}</span>
            </p>
            <p className="text-gray-600">
              <span className="text-gray-600">Advance Amount:</span>
              <span className="font-medium ml-1">₹{orderDetails.advanceAmount.toLocaleString()}</span>
            </p>
            <p className="text-gray-600">
              <span className="text-gray-600">Service Date:</span>
              <span className="font-medium ml-1">
                {orderDetails.serviceDate ? 
                  formatDateOnly(orderDetails.serviceDate)
                  : 'N/A'
                }
              </span>
            </p>
            <p className="text-gray-600">
              <span className="text-gray-600">Time Slot:</span>
              <span className="font-medium ml-1">
                {formatServiceDateTime(orderDetails.timeSlot, orderDetails.serviceDate) || 'N/A'}
              </span>
            </p>
            <p className="text-gray-600">
              <span className="text-gray-600">Mode:</span>
              <span className="font-medium ml-1">{orderDetails.mode}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
