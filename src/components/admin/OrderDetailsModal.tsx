"use client";

import React from 'react';
import { XMarkIcon, UserIcon, PhoneIcon, MapPinIcon, CalendarIcon, CurrencyDollarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate, getStatusColor } from '@/utils/orders';
import { getTimeSlotDisplay } from '@/utils/timeSlots';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  mobileNumber: string;
  city: string;
  address: string;
  pinCode: string;
  serviceType: string;
  serviceDate: string;
  timeSlot: string;
  amount: number;
  currency: string;
  status: string;
  partner: string;
  orderDate: string;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8">
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {/* Customer Information */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Name:</span>
                  <p className="text-sm text-gray-900">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Phone:</span>
                  <p className="text-sm text-gray-900">{order.mobileNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Service Information */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-green-600" />
              Service Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Service Type:</span>
                  <p className="text-sm text-gray-900">{order.serviceType}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Service Date:</span>
                  <p className="text-sm text-gray-900">{formatDate(order.serviceDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Time Slot:</span>
                  <p className="text-sm text-gray-900">{getTimeSlotDisplay(order.timeSlot)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Location Information */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-red-600" />
              Location Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Address:</span>
                  <p className="text-sm text-gray-900">{order.address || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700">City:</span>
                  <p className="text-sm text-gray-900">{order.city}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700">PIN Code:</span>
                  <p className="text-sm text-gray-900">{order.pinCode || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Financial Information */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
              Financial Information
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                <p className="text-2xl font-bold text-green-600">₹{order.amount.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-700">Currency:</span>
                <p className="text-sm text-gray-900">{order.currency}</p>
              </div>
            </div>
          </Card>

          {/* Partner Information */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-purple-600" />
              Partner Information
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Assigned Partner:</span>
                <p className={`text-lg font-semibold ${
                  order.partner === 'Ready to Assign' 
                    ? 'text-orange-600' 
                    : 'text-gray-900'
                }`}>
                  {order.partner}
                </p>
              </div>
              {order.partner === 'Ready to Assign' && (
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    Needs Assignment
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Order Metadata */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Order Number:</span>
                <p className="text-sm text-gray-900 font-mono">{order.orderNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Order Date:</span>
                <p className="text-sm text-gray-900">{order.orderDate}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
