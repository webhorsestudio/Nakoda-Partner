import { useState, useEffect, useCallback } from 'react';

interface PartnerOrder {
  id: string;
  isExclusive: boolean;
  countdown: string;
  scheduledTime: string;
  location: string;
  credits: number;
  likes: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  category: string;
  customerName: string;
  estimatedDuration: string;
  orderNumber?: string;
  advanceAmount?: string;
  taxesAndFees?: string;
  commissionPercentage?: string;
}

interface PartnerOrdersResponse {
  success: boolean;
  data: PartnerOrder[];
  total: number;
  partner: {
    id: number;
    name: string;
    serviceType: string;
  };
  error?: string; // optional error message when success is false
}

export function usePartnerOrders(mobile: string | undefined) {
  const [orders, setOrders] = useState<PartnerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [partnerInfo, setPartnerInfo] = useState<{ id: number; name: string; serviceType: string } | null>(null);

  const fetchOrders = useCallback(async (status: string = 'all', limit: number = 10) => {
    if (!mobile) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/partners/orders?mobile=${encodeURIComponent(mobile)}&status=${status}&limit=${limit}`
      );
      const result: PartnerOrdersResponse = await response.json();

      if (result.success) {
        setOrders(result.data);
        setTotalOrders(result.total);
        setPartnerInfo(result.partner);
      } else {
        setError(result.error || 'Failed to fetch orders');
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error('Error fetching partner orders:', error);
      setError('Failed to fetch orders');
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setIsLoading(false);
    }
  }, [mobile]);

  const refreshOrders = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getOrdersByStatus = useCallback((status: string) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  const getPendingOrders = useCallback(() => {
    return getOrdersByStatus('pending');
  }, [getOrdersByStatus]);

  const getAcceptedOrders = useCallback(() => {
    return getOrdersByStatus('accepted');
  }, [getOrdersByStatus]);

  const getCompletedOrders = useCallback(() => {
    return getOrdersByStatus('completed');
  }, [getOrdersByStatus]);

  // Fetch orders when mobile number changes
  useEffect(() => {
    if (mobile) {
      fetchOrders();
    }
  }, [mobile, fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    totalOrders,
    partnerInfo,
    fetchOrders,
    refreshOrders,
    getOrdersByStatus,
    getPendingOrders,
    getAcceptedOrders,
    getCompletedOrders
  };
}
