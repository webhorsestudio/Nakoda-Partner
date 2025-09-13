"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { toast } from 'react-hot-toast';
import { 
  OrdersHeader, 
  OrdersSearchAndFilter, 
  OrdersStats, 
  OrdersTable, 
  OrdersCountdown
} from '@/components/orders';
import { GlobalSyncStatus } from '@/components/GlobalSyncStatus';
import { useOrders } from '@/hooks/useOrders';
import { useAutoFetch } from '@/contexts/AutoFetchContext';
import { OrderFilters } from '@/types/orders';

// Loading component for Suspense fallback
function OrdersLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 bg-gray-200 rounded mb-8"></div>
        <div className="h-12 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

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

  // Memoized filter change handlers for better performance
  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    goToPage(1); // Reset to first page when searching
  }, [goToPage]);

  const handleStatusFilterChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, status: value }));
    goToPage(1); // Reset to first page when filtering
  }, [goToPage]);

  // Fetch orders when filters change or when new data is synced
  useEffect(() => {
    if (Object.keys(filters).length > 0 || lastFetchTime) {
      fetchOrders(filters);
    }
  }, [filters, lastFetchTime, fetchOrders]);

  // Listen for custom events from both background service and global fetcher
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

    // Add event listeners for both event types
    window.addEventListener('ordersDataFetched', handleDataFetched as EventListener);
    window.addEventListener('globalOrdersUpdated', handleDataFetched as EventListener);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('ordersDataFetched', handleDataFetched as EventListener);
      window.removeEventListener('globalOrdersUpdated', handleDataFetched as EventListener);
    };
  }, [fetchOrders, filters]);

  // Memoized error display
  const errorDisplay = useMemo(() => {
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
    return null;
  }, [error]);

  if (errorDisplay) {
    return errorDisplay;
  }

  return (
    <Suspense fallback={<OrdersLoadingSkeleton />}>
      <div className="min-h-screen bg-gray-50">
        <OrdersHeader />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Global Sync Status */}
          <div className="mb-4">
            <GlobalSyncStatus />
          </div>
          
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
    </Suspense>
  );
}
