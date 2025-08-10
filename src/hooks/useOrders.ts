import { useState, useEffect, useCallback, useMemo } from "react";
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch orders");
      }

      setOrders(data.data || []);
      setTotalOrders(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch stats");
      }

      if (data.success && data.data) {
        setStats(data.data);
      } else {
        throw new Error("Invalid stats data received");
      }
    } catch (err) {
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync orders");
      }

      // Refresh orders after sync
      await fetchOrders();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error syncing orders:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchOrders, fetchStats]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  // Fetch orders when page changes
  useEffect(() => {
    fetchOrders();
  }, [currentPage, fetchOrders]);

  // Initial load
  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

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
