import { useState, useEffect, useCallback } from 'react';
import { AdminOrder, ApiOrderData } from '@/types/orders';

interface UseAdminOrdersReturn {
  orders: AdminOrder[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  searchTerm: string;
  statusFilter: string;
  dateFrom: string;
  dateTo: string;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  setCurrentPage: (page: number) => void;
  refreshOrders: () => void;
}

export const useAdminOrders = (): UseAdminOrdersReturn => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(50); // Fixed at 50 items per page
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: statusFilter,
        search: searchTerm
      });

      // Add date filters if provided
      if (dateFrom) {
        params.append('dateFrom', dateFrom);
      }
      if (dateTo) {
        params.append('dateTo', dateTo);
      }

      const response = await fetch(`/api/admin/orders/realtime-orders?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.orders)) {
        const transformedOrders = result.orders.map((order: ApiOrderData) => {
          const partnerDisplay = order.partnerName || 'Ready to Assign';
          
          return {
            id: order.id,
            orderNumber: order.orderNumber || 'N/A',
            title: order.title,
            customerName: order.customerName || 'Unknown Customer',
            mobileNumber: order.customerPhone || '',
            city: order.city || '',
            address: order.address || '',
            pinCode: order.pinCode || '',
            serviceType: order.serviceType || order.package || 'General Service',
            serviceDate: order.serviceDate || '',
            timeSlot: order.timeSlot || '',
            amount: parseFloat(String(order.amount || '0')) || 0,
            advanceAmount: parseFloat(String(order.advanceAmount || '0')) || 0,
            taxesAndFees: order.taxesAndFees || '0',
            vendorAmount: order.vendorAmount || '',
            currency: order.currency || 'INR',
            status: order.status || 'pending',
            partner: partnerDisplay,
            orderDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''
          };
        });
        
        setOrders(transformedOrders);
        setTotalPages(result.stats?.totalPages || 1);
        setTotalItems(result.stats?.total || 0);
      } else {
        setOrders([]);
        setTotalPages(1);
        setTotalItems(0);
        if (result.error) {
          setError(result.error);
        } else {
          setError('No orders data received from server');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      setOrders([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, dateFrom, dateTo]);

  // Fetch orders when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset to page 1 when search term, status filter, or date filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  const refreshOrders = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchTerm,
    statusFilter,
    dateFrom,
    dateTo,
    setSearchTerm,
    setStatusFilter,
    setDateFrom,
    setDateTo,
    setCurrentPage,
    refreshOrders
  };
};
