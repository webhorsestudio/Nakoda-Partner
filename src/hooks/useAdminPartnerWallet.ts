import { useState, useCallback, useEffect } from 'react';
import { PartnerWallet, PartnerWalletFilters, WalletStats, AddBalanceRequest, WalletPagination } from '@/types/partnerWallet';

interface UseAdminPartnerWalletReturn {
  partners: PartnerWallet[];
  stats: WalletStats | null;
  loading: boolean;
  error: string | null;
  pagination: WalletPagination | null;
  filters: PartnerWalletFilters;
  fetchPartners: (newFilters?: Partial<PartnerWalletFilters>) => Promise<void>;
  fetchStats: () => Promise<void>;
  addBalance: (request: AddBalanceRequest) => Promise<boolean>;
  setFilters: (filters: Partial<PartnerWalletFilters>) => void;
  clearFilters: () => void;
}

export function useAdminPartnerWallet(): UseAdminPartnerWalletReturn {
  const [partners, setPartners] = useState<PartnerWallet[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<WalletPagination | null>(null);
  const [filters, setFiltersState] = useState<PartnerWalletFilters>({
    page: 1,
    limit: 20
  });

  const fetchPartners = useCallback(async (newFilters?: Partial<PartnerWalletFilters>) => {
    try {
      setLoading(true);
      setError(null);

      // Update filters state first
      if (newFilters) {
        setFiltersState(prev => ({ ...prev, ...newFilters }));
      }

      // Get current filters for API call
      const currentFilters = newFilters ? { ...filters, ...newFilters } : filters;
      
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/partners/wallet?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setPartners(data.data || []);
        setPagination(data.pagination || null);
      } else {
        throw new Error(data.error || 'Failed to fetch partners');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Remove filters dependency to prevent infinite loop

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/partners/wallet/stats');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch stats');
      }
    } catch (err) {
      console.error('Error fetching wallet stats:', err);
      // Don't set error for stats to avoid blocking the UI
    }
  }, []);

  const addBalance = useCallback(async (request: AddBalanceRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/partners/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.success) {
        // Refresh partners list and stats without dependencies
        fetchPartners();
        fetchStats();
        return true;
      } else {
        throw new Error(data.error || 'Failed to add balance');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add balance';
      setError(errorMessage);
      console.error('Error adding balance:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []); // Remove dependencies to prevent infinite loop

  const setFilters = useCallback((newFilters: Partial<PartnerWalletFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({
      page: 1,
      limit: 20
    });
  }, []);

  // Auto-fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    partners,
    stats,
    loading,
    error,
    pagination,
    filters,
    fetchPartners,
    fetchStats,
    addBalance,
    setFilters,
    clearFilters
  };
}
