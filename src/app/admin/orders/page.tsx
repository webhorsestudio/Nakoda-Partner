"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  OrdersHeader, 
  OrdersSearchAndFilter, 
  OrdersStats, 
  OrdersTable, 
  OrdersCountdown
} from '@/components/orders';
import { useOrders } from '@/hooks/useOrders';
import { useAutoFetch } from '@/contexts/AutoFetchContext';
import { OrderFilters } from '@/types/orders';

export default function OrdersPage() {
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: '',
  });

  // State to track when table is refreshing due to background service
  const [isTableRefreshing, setIsTableRefreshing] = useState(false);

  // Use the auto-fetch context for automatic syncing
  const {
    lastFetchTime,
    triggerManualFetch,
  } = useAutoFetch();

  // Use the orders hook for displaying orders
  const {
    orders,
    stats,
    loading,
    error,
    currentPage,
    totalPages,
    totalOrders,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    fetchOrders,
  } = useOrders();

  // Fetch orders when filters change or when new data is synced
  useEffect(() => {
    // Only fetch if we have filters or if this is a refresh from sync
    if (Object.keys(filters).length > 0 || lastFetchTime) {
      fetchOrders(filters);
    }
  }, [filters, lastFetchTime, fetchOrders]);

  // Listen for custom events from background service when new data is fetched
  useEffect(() => {
    const handleDataFetched = (event: CustomEvent) => {
      console.log('New orders data fetched:', event.detail);
      
      // Set refreshing state to show visual indicator
      setIsTableRefreshing(true);
      
      // Automatically refresh the orders table with current filters
      fetchOrders(filters);
      
      // Show a toast notification about the new data
      if (event.detail.data) {
        const { created, updated } = event.detail.data;
        if (created > 0 || updated > 0) {
          // Show success toast for new data
          if (created > 0 && updated > 0) {
            toast.success(`🔄 Auto-synced: ${created} new orders, ${updated} updated orders`);
          } else if (created > 0) {
            toast.success(`🆕 Auto-synced: ${created} new orders found`);
          } else if (updated > 0) {
            toast.success(`📝 Auto-synced: ${updated} orders updated`);
          }
        } else {
          // Show info toast when no new data
          toast.success('✅ Orders are up to date');
        }
      }
      
      // Clear refreshing state after a short delay
      setTimeout(() => {
        setIsTableRefreshing(false);
      }, 2000);
    };

    // Add event listener for custom events
    window.addEventListener('ordersDataFetched', handleDataFetched as EventListener);

    // Cleanup event listener
    return () => {
      window.removeEventListener('ordersDataFetched', handleDataFetched as EventListener);
    };
  }, [fetchOrders, filters]);

  // Handle search change
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    goToPage(1); // Reset to first page when searching
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }));
    goToPage(1); // Reset to first page when filtering
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Error Loading Orders</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OrdersHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Countdown Timer */}
        <OrdersCountdown
          onManualFetch={triggerManualFetch}
        />

        {/* Search and Filters */}
        <OrdersSearchAndFilter
          searchTerm={filters.search || ''}
          statusFilter={filters.status || 'all'}
          onSearchChange={handleSearchChange}
          onStatusFilterChange={handleStatusFilterChange}
        />

        {/* Stats Cards */}
        <OrdersStats stats={stats} />

        {/* Orders Table */}
        <OrdersTable
          orders={orders}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalOrders={totalOrders}
          pageSize={pageSize}
          onPageChange={goToPage}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onOrderUpdated={fetchOrders}
          isRefreshing={isTableRefreshing}
        />
      </div>
    </div>
  );
}
