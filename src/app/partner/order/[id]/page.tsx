'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/partner';
import {
  OrderDetailsHeader,
  CustomerInfoSection,
  ServiceDetailsSection,
  FinancialDetailsSection,
  OrderActions,
  sampleOrderDetails
} from '@/components/partner/tabs/new-task/order-details';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  // In a real app, you would fetch order details by orderId
  const order = sampleOrderDetails;

  const handleBack = () => {
    router.push('/partner?tab=new-task');
  };

  const handleAcceptOrder = (orderId: string) => {
    console.log('Accepting order:', orderId);
    // TODO: Implement order acceptance logic
    router.push('/partner?tab=new-task');
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'new-task') {
      router.push('/partner?tab=new-task');
      return;
    }
    router.push(`/partner?tab=${tabId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-slate-900">Order Details</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Order Details Header */}
        <OrderDetailsHeader order={order} onClose={handleBack} />
        
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
            advanceAmount: order.advanceAmount,
            balanceAmount: order.balanceAmount,
            commissionPercentage: order.commissionPercentage,
            commissionAmount: order.commissionAmount,
            taxesAndFees: order.taxesAndFees
          }}
        />
        
        {/* Order Actions */}
        <OrderActions
          orderId={orderId}
          status={order.status}
          onAcceptOrder={handleAcceptOrder}
          onClose={handleBack}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="new-task" onTabChange={handleTabChange} />
    </div>
  );
}
