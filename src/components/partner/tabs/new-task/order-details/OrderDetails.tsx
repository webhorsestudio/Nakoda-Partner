import React from 'react';
import { OrderDetailsProps } from './types';
import { sampleOrderDetails } from './sampleData';
import OrderDetailsHeader from './OrderDetailsHeader';
import CustomerInfoSection from './CustomerInfoSection';
import ServiceDetailsSection from './ServiceDetailsSection';
import FinancialDetailsSection from './FinancialDetailsSection';
import OrderActions from './OrderActions';

export default function OrderDetails({ orderId, onClose, onAcceptOrder }: OrderDetailsProps) {
  // In a real app, you would fetch order details by orderId
  const order = sampleOrderDetails;
  
  const handleAcceptOrder = (orderId: string) => {
    onAcceptOrder(orderId);
    onClose(); // Close the details view after accepting
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-slate-50 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl">
        {/* Header */}
        <OrderDetailsHeader order={order} onClose={onClose} />
        
        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 max-h-[calc(90vh-200px)]">
          {/* Customer Information */}
          <CustomerInfoSection
            customer={{
              name: order.customerName,
              phone: order.customerPhone,
              email: order.customerEmail,
              address: order.customerAddress,
              city: order.customerCity,
              pinCode: order.customerPinCode
            }}
          />
          
          {/* Service Details */}
          <ServiceDetailsSection
            service={{
              title: order.title,
              category: order.category,
              subcategory: order.subcategory,
              description: order.description,
              instructions: order.serviceInstructions,
              requirements: order.requirements,
              specialRequirements: order.specialRequirements,
              estimatedDuration: order.estimatedDuration,
              serviceDate: order.serviceDate,
              serviceTime: order.serviceTime
            }}
          />
          
          {/* Financial Details */}
          <FinancialDetailsSection
            financial={{
              totalAmount: order.totalAmount,
              advanceAmount: order.advanceAmount
            }}
          />
        </div>
        
        {/* Actions */}
        <OrderActions
          orderId={orderId}
          status={order.status}
          onAcceptOrder={handleAcceptOrder}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
