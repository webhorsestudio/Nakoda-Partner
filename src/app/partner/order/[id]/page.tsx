'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  OrderDetailsHeader,
  CustomerInfoSection,
  ServiceDetailsSection,
  FinancialDetailsSection
} from '@/components/partner/tabs/new-task/order-details';
import SlideToConfirm from '@/components/partner/tabs/new-task/order-details/SlideToConfirm';
import { OrderDetails } from '@/components/partner/tabs/new-task/order-details/types';
import { notificationService } from '@/services/notificationService';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [partner, setPartner] = useState<{ id: string; name: string; city: string; serviceType: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  // Fetch order details on component mount
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/partners/orders/${orderId}`, {
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
      console.error('Error fetching order details:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/partner?tab=new-task');
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      setAccepting(true);
      setError(null);

      const response = await fetch(`/api/partners/orders/${orderId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to accept order');
      }

      if (data.success) {
        // Show success message and redirect
        notificationService.success(
          `Order accepted successfully! Advance amount ₹${data.advanceAmount} deducted from your wallet.`,
          { duration: 5000 }
        );
        // Small delay to show the toast before redirecting
        setTimeout(() => {
          router.push('/partner?tab=new-task');
        }, 1500);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept order';
      setError(errorMessage);
      notificationService.error(errorMessage);
    } finally {
      setAccepting(false);
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
              <h1 className="text-lg font-semibold text-slate-900">Order Details</h1>
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
              <h1 className="text-lg font-semibold text-slate-900">Order Details</h1>
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
              <h1 className="text-lg font-semibold text-slate-900">Order Details</h1>
            </div>
          </div>
        </div>

        {/* No Data Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Order Not Found</h3>
              <p className="text-slate-600 mb-4">The requested order could not be found or is no longer available.</p>
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
            <h1 className="text-lg font-semibold text-slate-900">Order Details</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-4xl mx-auto px-4 py-6 space-y-6 ${order?.status === 'pending' ? 'pb-24' : ''}`}>
        {/* Order Details Header */}
        <OrderDetailsHeader 
          order={{
            ...order,
            assignedPartner: partner?.name
          }} 
          onClose={handleBack}
        />
        
        {/* Customer Information */}
        <CustomerInfoSection
          customer={{
            name: order.customerName,
            phone: order.customerPhone,
            email: order.customerEmail || '',
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
            totalAmount: order.amount,
            advanceAmount: order.advanceAmount
          }}
        />
        
        {/* Slide to Confirm - Fixed Footer */}
        {order.status === 'pending' && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-50">
            <div className="max-w-4xl mx-auto">
              <SlideToConfirm
                onConfirm={() => handleAcceptOrder(orderId)}
                disabled={accepting}
                text="Slide to accept order"
                confirmText="Order accepted!"
                className="w-full"
              />
            </div>
          </div>
        )}
        
      </div>

    </div>
  );
}
