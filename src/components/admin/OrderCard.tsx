"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { 
  UserIcon, 
  PhoneIcon, 
  MapPinIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/solid";
import { formatDateOnly } from "@/utils/orders";

interface Order {
  id: string;
  customerName: string;
  mobileNumber: string;
  city: string;
  serviceType: string;
  serviceDate: string;
  amount: number;
  partner: string;
  orderNumber: string;
  orderDate: string;
}

interface OrderCardProps {
  order: Order;
  onViewOrder?: (orderId: string) => void;
  onEditOrder?: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onViewOrder,
  onEditOrder,
  onDeleteOrder
}) => {
  const [activeDropdown, setActiveDropdown] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  // Debug props
  console.log('OrderCard rendered with:', {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    hasOnViewOrder: !!onViewOrder,
    hasOnEditOrder: !!onEditOrder,
    hasOnDeleteOrder: !!onDeleteOrder,
    activeDropdown
  });

  // Click outside handler for dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Check if click is outside the dropdown container
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeDropdown) {
        setActiveDropdown(false);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [activeDropdown]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200" style={{ overflow: 'visible' }}>
      {/* Header with Order Number and Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">Order #{order.orderNumber}</div>
          <div className="text-lg font-semibold text-gray-900">{order.customerName}</div>
        </div>

        {/* Actions Dropdown */}
        <div className="relative dropdown-container">
          <button 
            ref={buttonRef}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Dropdown button clicked, current state:', activeDropdown);
              const newState = !activeDropdown;
              console.log('Setting dropdown state to:', newState);
              
              if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setButtonRect(rect);
                console.log('Button position:', rect);
              }
              
              setActiveDropdown(newState);
            }}
          >
            <EllipsisVerticalIcon className="h-4 w-4" />
          </button>
          
          {activeDropdown && buttonRect && createPortal(
            <div 
              className="fixed w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
              style={{ 
                backgroundColor: 'white', 
                border: '2px solid red', 
                zIndex: 9999,
                position: 'fixed',
                top: buttonRect.bottom + 4,
                left: buttonRect.right - 192,
                width: '192px'
              }}
            >
              <div style={{ padding: '4px', backgroundColor: 'yellow' }}>
                DEBUG: Portal Dropdown is visible!
              </div>
              <button 
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('View Order clicked for:', order.id);
                  onViewOrder?.(order.id);
                  setActiveDropdown(false);
                }}
              >
                <EyeIcon className="h-4 w-4" />
                <span>View Details</span>
              </button>
              <button 
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Edit Order clicked for:', order.id);
                  onEditOrder?.(order.id);
                  setActiveDropdown(false);
                }}
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit Order</span>
              </button>
              <button 
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Delete Order clicked for:', order.id);
                  onDeleteOrder?.(order.id);
                  setActiveDropdown(false);
                }}
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete Order</span>
              </button>
            </div>,
            document.body
          )}
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Customer:</span> {order.customerName}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <PhoneIcon className="h-4 w-4 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Phone:</span> {order.mobileNumber}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <MapPinIcon className="h-4 w-4 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Location:</span> {order.city}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Service:</span> {order.serviceType}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Date:</span> {formatDateOnly(order.serviceDate)}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Amount:</span> 
            <span className="font-semibold text-green-600 ml-1">₹{order.amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Partner and Amount */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Partner:</span> {order.partner}
        </div>
        <div className="flex items-center space-x-1">
          <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
          <span className="font-bold text-green-600">₹{order.amount.toLocaleString()}</span>
        </div>
      </div>

      {/* Order Date */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        Ordered on {order.orderDate}
      </div>
    </div>
  );
};
