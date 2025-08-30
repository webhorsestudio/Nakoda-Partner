import { useState, useCallback, useMemo, useEffect } from "react";
import { Partner, PartnerStats, PartnerFilters } from "@/types/partners";

interface UsePartnersReturn {
  // Data
  partners: Partner[];
  stats: PartnerStats | null;
  
  // Loading states
  loading: boolean;
  loadingStats: boolean;
  
  // Error states
  error: string | null;
  errorStats: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  pageSize: number;
  
  // Filters
  filters: PartnerFilters;
  
  // Actions
  fetchPartners: (filters?: PartnerFilters) => Promise<void>;
  fetchStats: () => Promise<void>;
  createPartner: (partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => Promise<Partner>;
  updatePartner: (id: number, partner: Partial<Partner>) => Promise<Partner>;
  deletePartner: (id: number) => Promise<void>;
  updatePartnerStatus: (id: number, status: Partner['status']) => Promise<void>;
  updateVerificationStatus: (id: number, verificationStatus: Partner['verification_status'], documentsVerified: boolean) => Promise<void>;
  
  // Pagination helpers
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  
  // Filter helpers
  updateFilters: (newFilters: Partial<PartnerFilters>) => void;
  clearFilters: () => void;
}

export function usePartners(pageSize: number = 10): UsePartnersReturn {
  // State
  const [partners, setPartners] = useState<Partner[]>([]);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<PartnerFilters>({
    page: 1,
    limit: pageSize
  });

  // Computed values
  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  // Fetch partners
  const fetchPartners = useCallback(async (newFilters?: PartnerFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      const currentFilters = { ...filters, ...newFilters };
      
      // Add filters to query params
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/partners?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPartners(data.data || []);
        setTotal(data.total || 0);
        setCurrentPage(currentFilters.page || 1);
      } else {
        throw new Error(data.error || "Failed to fetch partners");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch partners";
      setError(errorMessage);
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]); // Include filters dependency

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setErrorStats(null);
      
      const response = await fetch("/api/partners/stats");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch partner statistics");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch partner statistics";
      setErrorStats(errorMessage);
      console.error("Error fetching partner stats:", error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Create partner
  const createPartner = useCallback(async (partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Promise<Partner> => {
    try {
      const response = await fetch("/api/partners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ partner }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh partners list with current filters and page
        await fetchPartners({ ...filters, page: currentPage });
        return data.data;
      } else {
        throw new Error(data.error || "Failed to create partner");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create partner";
      throw new Error(errorMessage);
    }
  }, [fetchPartners, filters, currentPage]);

  // Update partner
  const updatePartner = useCallback(async (id: number, partner: Partial<Partner>): Promise<Partner> => {
    try {
      const response = await fetch(`/api/partners/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ partner }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setPartners(prev => prev.map(p => p.id === id ? data.data : p));
        return data.data;
      } else {
        throw new Error(data.error || "Failed to update partner");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update partner";
      throw new Error(errorMessage);
    }
  }, []);

  // Delete partner
  const deletePartner = useCallback(async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/partners/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Remove from local state
        setPartners(prev => prev.filter(p => p.id !== id));
        // Refresh stats
        await fetchStats();
      } else {
        throw new Error(data.error || "Failed to delete partner");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete partner";
      console.error("Delete partner error details:", error);
      throw new Error(errorMessage);
    }
  }, [fetchStats]);

  // Update partner status
  const updatePartnerStatus = useCallback(async (id: number, status: Partner['status']): Promise<void> => {
    try {
      await updatePartner(id, { status });
      // Refresh stats
      await fetchStats();
    } catch (error) {
      throw error;
    }
  }, [updatePartner, fetchStats]);

  // Update verification status
  const updateVerificationStatus = useCallback(async (id: number, verificationStatus: Partner['verification_status'], documentsVerified: boolean): Promise<void> => {
    try {
      await updatePartner(id, { verification_status: verificationStatus, documents_verified: documentsVerified });
      // Refresh stats
      await fetchStats();
    } catch (error) {
      throw error;
    }
  }, [updatePartner, fetchStats]);

  // Pagination helpers
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

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Filter helpers
  const updateFilters = useCallback((newFilters: Partial<PartnerFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset to first page
    setFilters(updatedFilters);
  }, [filters]);

  const clearFilters = useCallback(() => {
    const clearedFilters: PartnerFilters = {
      page: 1,
      limit: pageSize
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
  }, [pageSize]);

  // Effects
  useEffect(() => {
    fetchPartners({ ...filters, page: currentPage });
  }, [currentPage, filters.page, filters.limit, filters.search, filters.status, filters.verification_status, fetchPartners]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]); // Include fetchStats dependency

  return {
    // Data
    partners,
    stats,
    
    // Loading states
    loading,
    loadingStats,
    
    // Error states
    error,
    errorStats,
    
    // Pagination
    currentPage,
    totalPages,
    pageSize,
    
    // Filters
    filters,
    
    // Actions
    fetchPartners,
    fetchStats,
    createPartner,
    updatePartner,
    deletePartner,
    updatePartnerStatus,
    updateVerificationStatus,
    
    // Pagination helpers
    nextPage,
    prevPage,
    goToPage,
    
    // Filter helpers
    updateFilters,
    clearFilters,
  };
}
