import { useState, useCallback, useMemo, useEffect } from "react";
import { Order, OrderStats, OrderFilters } from "@/types/orders";

interface UseOrdersReturn {
  orders: Order[];
  stats: OrderStats | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  pageSize: number;
  syncOrders: () => Promise<void>;
  fetchOrders: (filters?: OrderFilters) => Promise<void>;
  fetchStats: () => Promise<void>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const pageSize = 30;

  // Calculate total pages - moved to top to avoid ReferenceError
  const totalPages = useMemo(() => Math.ceil(totalOrders / pageSize), [totalOrders, pageSize]);

  const fetchOrders = useCallback(async (filters: OrderFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      // Add pagination parameters
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());

      const response = await fetch(`/api/orders?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      setOrders(data.data || []);
      setTotalOrders(data.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  const fetchStats = useCallback(async () => {
    try {
      // Don't set loading for stats to avoid UI blocking
      const response = await fetch("/api/orders/stats", {
        method: "GET",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.success && data.data) {
        setStats(data.data);
      } else {
        throw new Error("Invalid stats data received");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch stats";
      console.error("Error fetching stats:", err);
      // Don't set error for stats to avoid blocking the UI
    }
  }, []);

  const syncOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/orders/sync", {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.success) {
        // Refresh orders after successful sync
        await fetchOrders();
        return data;
      } else {
        throw new Error(data.error || "Sync failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sync orders";
      setError(errorMessage);
      console.error("Error syncing orders:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  // Auto-fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    orders,
    stats,
    loading,
    error,
    currentPage,
    totalPages,
    totalOrders,
    pageSize,
    syncOrders,
    fetchOrders,
    fetchStats,
    goToPage,
    nextPage,
    prevPage,
  };
}
