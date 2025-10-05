import { useState, useCallback } from 'react';

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

interface UseOrderDetailsReturn {
  // Data
  fetchedOrderDetails: Bitrix24OrderDetails | null;
  fetchingOrder: boolean;
  fetchError: string | null;
  
  // Actions
  fetchOrderFromBitrix24: (orderNumber: string) => Promise<void>;
  clearOrderDetails: () => void;
}

export const useOrderDetails = (): UseOrderDetailsReturn => {
  const [fetchedOrderDetails, setFetchedOrderDetails] = useState<Bitrix24OrderDetails | null>(null);
  const [fetchingOrder, setFetchingOrder] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchOrderFromBitrix24 = useCallback(async (orderNumber: string) => {
    if (!orderNumber.trim()) {
      setFetchError('Please enter an Order Number');
      return;
    }

    try {
      setFetchingOrder(true);
      setFetchError(null);
      setFetchedOrderDetails(null);

      const response = await fetch('/api/admin/orders/fetch-bitrix24', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderNumber: orderNumber.trim() 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.orderDetails) {
        setFetchedOrderDetails(result.orderDetails);
      } else {
        const errorMessage = result.error || 'Order not found in Bitrix24';
        const suggestion = result.suggestion ? `\n\n💡 ${result.suggestion}` : '';
        const recentDeals = result.recentDeals ? 
          `\n\n📋 Recent orders with data:\n${result.recentDeals.map((deal: { ID: string; customerName: string; orderNumber: string; amount?: string }) => 
            `• ${deal.orderNumber} - ${deal.customerName} - ₹${deal.amount?.split('|')[0] || '0'}`
          ).join('\n')}` : '';
        setFetchError(errorMessage + suggestion + recentDeals);
      }
    } catch (err) {
      console.error('Failed to fetch order from Bitrix24:', err);
      setFetchError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setFetchingOrder(false);
    }
  }, []);

  const clearOrderDetails = useCallback(() => {
    setFetchedOrderDetails(null);
    setFetchError(null);
    setFetchingOrder(false);
  }, []);

  return {
    fetchedOrderDetails,
    fetchingOrder,
    fetchError,
    fetchOrderFromBitrix24,
    clearOrderDetails
  };
};
