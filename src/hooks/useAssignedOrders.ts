import { useState, useEffect, useCallback } from 'react';

export interface AssignedOrderDetail {
  orderNumber: string;
  status: string;
  amount: number;
  serviceDate: string;
  createdAt: string;
}

export interface PartnerWithAssignedOrders {
  id: number;
  name: string;
  mobile: string;
  email: string;
  serviceType: string;
  status: string;
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  city: string;
  verificationStatus: string;
  joinedDate: string;
  lastActive: string | null;
  documentsVerified: boolean;
  notes: string | null;
  
  // Assigned orders information
  assignedOrdersCount: number;
  totalAssignedAmount: number;
  statusBreakdown: Record<string, number>;
  assignedOrders: AssignedOrderDetail[];
}

interface UseAssignedOrdersReturn {
  partners: PartnerWithAssignedOrders[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  searchTerm: string;
  dateFrom: string;
  dateTo: string;
  totalAssignedOrders: number;
  setSearchTerm: (term: string) => void;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  setCurrentPage: (page: number) => void;
  refreshPartners: () => void;
}

export const useAssignedOrders = (): UseAssignedOrdersReturn => {
  const [partners, setPartners] = useState<PartnerWithAssignedOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAssignedOrders, setTotalAssignedOrders] = useState(0);
  const [itemsPerPage] = useState(50); // Fixed at 50 items per page
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm
      });

      // Add date filters if provided
      if (dateFrom) {
        params.append('dateFrom', dateFrom);
      }
      if (dateTo) {
        params.append('dateTo', dateTo);
      }

      const response = await fetch(`/api/admin/orders/assigned-orders?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.partners)) {
        setPartners(result.partners);
        setTotalPages(result.stats?.totalPages || 1);
        setTotalItems(result.stats?.total || 0);
        setTotalAssignedOrders(result.stats?.totalAssignedOrders || 0);
      } else {
        setPartners([]);
        setTotalPages(1);
        setTotalItems(0);
        setTotalAssignedOrders(0);
        if (result.error) {
          setError(result.error);
        } else {
          setError('No partners data received from server');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      setPartners([]);
      setTotalPages(1);
      setTotalItems(0);
      setTotalAssignedOrders(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, dateFrom, dateTo]);

  // Fetch partners when dependencies change
  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // Reset to page 1 when search term or date filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, dateFrom, dateTo]);

  const refreshPartners = useCallback(() => {
    fetchPartners();
  }, [fetchPartners]);

  return {
    partners,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchTerm,
    dateFrom,
    dateTo,
    totalAssignedOrders,
    setSearchTerm,
    setDateFrom,
    setDateTo,
    setCurrentPage,
    refreshPartners
  };
};
