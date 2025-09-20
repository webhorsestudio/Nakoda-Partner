import { useState, useEffect, useCallback } from 'react';

export interface PerformanceMetrics {
  totalEarnings: number;
  totalTasks: number;
  completedTasks: number;
  averageRating: number;
  totalReviews: number;
  activeHours: number;
  customerSatisfaction: number;
  onTimeCompletion: number;
}


export interface TaskPerformance {
  serviceType: string;
  totalTasks: number;
  completedTasks: number;
  averageRating: number;
  totalEarnings: number;
}

export interface UsePartnerReportingReturn {
  // Data
  performanceMetrics: PerformanceMetrics | null;
  taskPerformance: TaskPerformance[];
  
  // Loading states
  isLoadingMetrics: boolean;
  isLoadingPerformance: boolean;
  
  // Error states
  metricsError: string | null;
  performanceError: string | null;
  
  // Actions
  fetchMetrics: () => Promise<void>;
  fetchPerformance: (timeRange: string) => Promise<void>;
  refreshAll: (timeRange?: string) => Promise<void>;
}

export function usePartnerReporting(): UsePartnerReportingReturn {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [taskPerformance, setTaskPerformance] = useState<TaskPerformance[]>([]);
  
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false);
  
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [performanceError, setPerformanceError] = useState<string | null>(null);

  // Get authentication token from localStorage or cookies
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      // Try to get token from localStorage first
      const token = localStorage.getItem('auth-token');
      if (token) return token;
      
      // Try to get token from cookies
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
      if (authCookie) {
        return authCookie.split('=')[1];
      }
    }
    return null;
  };

  // Sample data for fallback when API calls fail
  const getSampleMetrics = (): PerformanceMetrics => ({
    totalEarnings: 12500.00,
    totalTasks: 45,
    completedTasks: 42,
    averageRating: 4.7,
    totalReviews: 38,
    activeHours: 120,
    customerSatisfaction: 4.6,
    onTimeCompletion: 93.3
  });


  const getSampleTaskPerformance = (): TaskPerformance[] => [
    {
      serviceType: 'Cleaning Service',
      totalTasks: 28,
      completedTasks: 25,
      averageRating: 4.8,
      totalEarnings: 3500.00
    },
    {
      serviceType: 'Maintenance',
      totalTasks: 12,
      completedTasks: 12,
      averageRating: 4.6,
      totalEarnings: 2800.00
    },
    {
      serviceType: 'Installation',
      totalTasks: 5,
      completedTasks: 5,
      averageRating: 4.9,
      totalEarnings: 1200.00
    }
  ];

  const fetchMetrics = useCallback(async (timeRange: string = '30d') => {
    setIsLoadingMetrics(true);
    setMetricsError(null);
    
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // For demo purposes, we'll still try the API call without auth
        console.log('No auth token found, proceeding with API call anyway');
      }

      const response = await fetch(`/api/partners/reporting/metrics?range=${timeRange}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setPerformanceMetrics(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch metrics');
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      setMetricsError(error instanceof Error ? error.message : 'Failed to fetch metrics');
      // Use sample data as fallback
      setPerformanceMetrics(getSampleMetrics());
    } finally {
      setIsLoadingMetrics(false);
    }
  }, []);


  const fetchPerformance = useCallback(async (timeRange: string = '30d') => {
    setIsLoadingPerformance(true);
    setPerformanceError(null);
    
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // For demo purposes, we'll still try the API call without auth
        console.log('No auth token found, proceeding with API call anyway');
      }

      const response = await fetch(`/api/partners/reporting/performance?range=${timeRange}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setTaskPerformance(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch performance data');
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setPerformanceError(error instanceof Error ? error.message : 'Failed to fetch performance data');
      // Use sample data as fallback
      setTaskPerformance(getSampleTaskPerformance());
    } finally {
      setIsLoadingPerformance(false);
    }
  }, []);

  const refreshAll = useCallback(async (timeRange: string = '30d') => {
    await Promise.all([
      fetchMetrics(timeRange),
      fetchPerformance(timeRange)
    ]);
  }, [fetchMetrics, fetchPerformance]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    // Data
    performanceMetrics,
    taskPerformance,
    
    // Loading states
    isLoadingMetrics,
    isLoadingPerformance,
    
    // Error states
    metricsError,
    performanceError,
    
    // Actions
    fetchMetrics,
    fetchPerformance,
    refreshAll,
  };
}
