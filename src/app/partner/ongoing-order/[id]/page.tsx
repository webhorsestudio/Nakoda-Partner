'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  OngoingOrderDetailsHeader,
  OngoingCustomerInfoSection,
  OngoingServiceLocationMap,
  OngoingFinancialDetailsSection,
  OngoingOrderActions
} from '@/components/partner/tabs/ongoing/order-details';
import { OngoingOrderDetails } from '@/components/partner/tabs/ongoing/order-details/types';

export default function OngoingOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OngoingOrderDetails | null>(null);
  const [partner, setPartner] = useState<{ id: string; name: string; city: string; serviceType: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details on component mount
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/partners/orders/accepted/${orderId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order details');
      }

      if (data.success && data.order) {
        setOrder(data.order);
        if (data.partner) {
          setPartner(data.partner);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching ongoing order details:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/partner?tab=ongoing');
  };

  const handleTaskCompleted = async () => {
    try {
      // TODO: Implement API call to mark task as completed
      console.log('Task completed:', orderId);
      
      // For now, just show a success message and redirect
      alert('Task marked as completed!');
      router.push('/partner?tab=ongoing');
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task. Please try again.');
    }
  };


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="px-4 py-3">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold text-slate-900">Ongoing Order Details</h1>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading order details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="px-4 py-3">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold text-slate-900">Ongoing Order Details</h1>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Order</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleBack}>
                  Go Back
                </Button>
                <Button onClick={fetchOrderDetails} className="bg-blue-600 hover:bg-blue-700">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No order data
  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="px-4 py-3">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold text-slate-900">Ongoing Order Details</h1>
            </div>
          </div>
        </div>

        {/* No Data Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Order Not Found</h3>
              <p className="text-slate-600 mb-4">The requested ongoing order could not be found or is no longer available.</p>
              <Button onClick={handleBack} className="bg-blue-600 hover:bg-blue-700">
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render order details
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-slate-900">Ongoing Order Details</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Order Details Header */}
        <OngoingOrderDetailsHeader 
          order={{
            ...order,
            assignedPartner: partner?.name
          }} 
          onClose={handleBack}
        />
        
        {/* Main Content */}
        <div className="space-y-6">
          <OngoingCustomerInfoSection
            customer={{
              name: order.customerName,
              phone: order.customerPhone,
              email: order.customerEmail || '',
              address: order.customerAddress,
              city: order.customerCity,
              pinCode: order.customerPinCode
            }}
          />
          
          <OngoingServiceLocationMap
            location={order.location}
            customerAddress={order.customerAddress}
            city={order.customerCity}
            pinCode={order.customerPinCode}
          />
          
          <OngoingFinancialDetailsSection
            financial={{
              totalAmount: order.totalAmount,
              advanceAmount: order.advanceAmount,
              balanceAmount: order.balanceAmount,
              commissionAmount: order.commissionAmount
            }}
          />
        </div>
      </div>

      {/* Actions - Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="max-w-4xl mx-auto">
          <OngoingOrderActions
            serviceDate={order.serviceDate}
            serviceTime={order.serviceTime}
            status={order.status}
            onTaskExpired={() => {
              console.log('Task has expired');
              // Handle task expiration if needed
            }}
            onTaskCompleted={handleTaskCompleted}
            taskId={orderId}
          />
        </div>
      </div>
    </div>
  );
}
