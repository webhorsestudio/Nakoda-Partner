import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Service, 
  ServicesResponse, 
  ServiceDashboardStats,
  ServiceFilters,
  ServiceFormData
} from '@/types/services';

interface UseServicesReturn {
  // Services
  services: Service[];
  servicesLoading: boolean;
  servicesError: string | null;
  
  // Statistics
  stats: ServiceDashboardStats | null;
  statsLoading: boolean;
  statsError: string | null;
  
  // Filters and pagination
  filters: ServiceFilters;
  totalServices: number;
  currentPage: number;
  
  // Functions
  fetchServices: (filters?: Partial<ServiceFilters>) => Promise<void>;
  fetchStats: () => Promise<void>;
  createService: (serviceData: ServiceFormData) => Promise<Service | null>;
  updateService: (id: number, serviceData: ServiceFormData) => Promise<Service | null>;
  deleteService: (id: number) => Promise<boolean>;
  toggleServiceStatus: (id: number) => Promise<boolean>;
  updateFilters: (newFilters: Partial<ServiceFilters>) => void;
  resetFilters: () => void;
}

export function useServices(): UseServicesReturn {
  // State for services
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  
  // State for statistics
  const [stats, setStats] = useState<ServiceDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  // State for filters and pagination
  const [filters, setFilters] = useState<ServiceFilters>({
    search: '',
    is_active: undefined
  });
  
  const [totalServices, setTotalServices] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch services with filters
  const fetchServices = useCallback(async (newFilters?: Partial<ServiceFilters>) => {
    try {
      setServicesLoading(true);
      setServicesError(null);
      
      const queryParams = new URLSearchParams();
      const currentFilters = { ...filters, ...newFilters };
      
      // Add filter parameters
      if (currentFilters.search) queryParams.append('search', currentFilters.search);
      if (currentFilters.is_active !== undefined) queryParams.append('is_active', currentFilters.is_active.toString());
      
      const response = await fetch(`/api/services?${queryParams.toString()}`);
      const data: ServicesResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch services');
      }
      
      if (data.success && data.data) {
        setServices(data.data);
        setTotalServices(data.total || 0);
        setCurrentPage(data.page || 1);
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch services';
      setServicesError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching services:', error);
    } finally {
      setServicesLoading(false);
    }
  }, [filters]);

  // Fetch service statistics
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      
      const response = await fetch('/api/services/stats');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch service statistics');
      }
      
      if (data.success && data.data) {
        setStats(data.data);
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch service statistics';
      setStatsError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching service statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Create a new service
  const createService = useCallback(async (serviceData: ServiceFormData): Promise<Service | null> => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create service');
      }
      
      if (data.success && data.data) {
        toast.success('Service created successfully');
        // Refresh services list
        await fetchServices();
        return data.data;
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create service';
      toast.error(errorMessage);
      console.error('Error creating service:', error);
      return null;
    }
  }, [fetchServices]);

  // Update an existing service
  const updateService = useCallback(async (id: number, serviceData: ServiceFormData): Promise<Service | null> => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update service');
      }
      
      if (data.success && data.data) {
        toast.success('Service updated successfully');
        // Refresh services list
        await fetchServices();
        return data.data;
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update service';
      toast.error(errorMessage);
      console.error('Error updating service:', error);
      return null;
    }
  }, [fetchServices]);

  // Delete a service
  const deleteService = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete service');
      }
      
      if (data.success) {
        toast.success('Service deleted successfully');
        // Refresh services list
        await fetchServices();
        return true;
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete service';
      toast.error(errorMessage);
      console.error('Error deleting service:', error);
      return false;
    }
  }, [fetchServices]);

  // Toggle service status
  const toggleServiceStatus = useCallback(async (id: number): Promise<boolean> => {
    try {
      const service = services.find(s => s.id === id);
      if (!service) {
        toast.error('Service not found');
        return false;
      }
      
      const newStatus = !service.is_active;
      const result = await updateService(id, { 
        name: service.name,
        description: service.description || '',
        is_active: newStatus 
      });
      return result !== null;
      
    } catch (error) {
      console.error('Error toggling service status:', error);
      return false;
    }
  }, [services, updateService]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ServiceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      is_active: undefined
    });
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchServices();
    fetchStats();
  }, [fetchServices, fetchStats]);

  // Fetch services when filters change
  useEffect(() => {
    fetchServices();
  }, [filters, fetchServices]);

  return {
    // Services
    services,
    servicesLoading,
    servicesError,
    
    // Statistics
    stats,
    statsLoading,
    statsError,
    
    // Filters and pagination
    filters,
    totalServices,
    currentPage,
    
    // Functions
    fetchServices,
    fetchStats,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    updateFilters,
    resetFilters,
  };
}