import { useState, useCallback, useEffect } from 'react';

interface RevenueData {
  date: string;
  earnings: number;
  tasks: number;
  commission: number;
}

interface RevenueStats {
  totalEarnings: number;
  totalTasks: number;
  averageEarnings: number;
  commissionEarned: number;
  pendingAmount: number;
  completedTasks: number;
  monthlyGrowth: number;
  weeklyGrowth: number;
}

interface ServiceBreakdown {
  serviceType: string;
  earnings: number;
  tasks: number;
  percentage: number;
  color: string;
}

interface Transaction {
  id: number;
  service: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  commission: number;
}

interface UsePartnerRevenueReturn {
  // Data
  revenueData: RevenueData[];
  revenueStats: RevenueStats | null;
  serviceBreakdown: ServiceBreakdown[];
  recentTransactions: Transaction[];
  
  // Loading states
  isLoadingRevenue: boolean;
  isLoadingStats: boolean;
  isLoadingTransactions: boolean;
  
  // Error states
  revenueError: string | null;
  statsError: string | null;
  transactionsError: string | null;
  
  // Actions
  fetchRevenueData: (timeRange: string) => Promise<void>;
  fetchRevenueStats: () => Promise<void>;
  fetchRecentTransactions: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

// Sample data for fallback
const getSampleRevenueData = (timeRange: string): RevenueData[] => {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '3m' ? 90 : timeRange === '6m' ? 180 : 365;
  const data: RevenueData[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const earnings = Math.floor(Math.random() * 5000) + 1000;
    const tasks = Math.floor(Math.random() * 15) + 3;
    const commission = Math.floor(earnings * 0.25);
    
    data.push({
      date: date.toISOString().split('T')[0],
      earnings,
      tasks,
      commission
    });
  }
  
  return data;
};

const getSampleRevenueStats = (): RevenueStats => ({
  totalEarnings: 45600,
  totalTasks: 156,
  averageEarnings: 292,
  commissionEarned: 11400,
  pendingAmount: 3200,
  completedTasks: 142,
  monthlyGrowth: 18.5,
  weeklyGrowth: 12.3
});

const getSampleServiceBreakdown = (): ServiceBreakdown[] => [
  { serviceType: 'Electrical', earnings: 18500, tasks: 62, percentage: 40.6, color: '#3B82F6' },
  { serviceType: 'Cleaning', earnings: 12300, tasks: 41, percentage: 27.0, color: '#10B981' },
  { serviceType: 'Plumbing', earnings: 8900, tasks: 28, percentage: 19.5, color: '#F59E0B' },
  { serviceType: 'HVAC', earnings: 4200, tasks: 15, percentage: 9.2, color: '#8B5CF6' },
  { serviceType: 'Other', earnings: 1700, tasks: 10, percentage: 3.7, color: '#EF4444' }
];

const getSampleTransactions = (): Transaction[] => [
  { id: 1, service: 'Electrical Repair', amount: 2500, status: 'completed', date: '2024-01-07', commission: 625 },
  { id: 2, service: 'House Cleaning', amount: 1800, status: 'completed', date: '2024-01-06', commission: 450 },
  { id: 3, service: 'Plumbing Fix', amount: 3200, status: 'pending', date: '2024-01-05', commission: 800 },
  { id: 4, service: 'AC Service', amount: 2100, status: 'completed', date: '2024-01-04', commission: 525 },
  { id: 5, service: 'Deep Cleaning', amount: 2900, status: 'completed', date: '2024-01-03', commission: 725 },
];

export function usePartnerRevenue(): UsePartnerRevenueReturn {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [serviceBreakdown, setServiceBreakdown] = useState<ServiceBreakdown[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  
  const [revenueError, setRevenueError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  // Get authentication token from localStorage or cookies
  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    // Try localStorage first - use the same token key as the auth system
    const token = localStorage.getItem('auth-token');
    if (token) return token;
    
    // Try cookies as fallback
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    
    return null;
  }, []);

  const fetchRevenueData = useCallback(async (timeRange: string = '30d') => {
    setIsLoadingRevenue(true);
    setRevenueError(null);
    
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.log('No auth token found, proceeding with API call anyway');
      }

      const response = await fetch(`/api/partners/revenue/data?range=${timeRange}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setRevenueData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch revenue data');
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setRevenueError(error instanceof Error ? error.message : 'Failed to fetch revenue data');
      // Use sample data as fallback
      setRevenueData(getSampleRevenueData(timeRange));
    } finally {
      setIsLoadingRevenue(false);
    }
  }, [getAuthToken]);

  const fetchRevenueStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.log('No auth token found, proceeding with API call anyway');
      }

      const response = await fetch('/api/partners/revenue/stats', {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setRevenueStats(result.data.stats);
        setServiceBreakdown(result.data.serviceBreakdown);
      } else {
        throw new Error(result.error || 'Failed to fetch revenue stats');
      }
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      setStatsError(error instanceof Error ? error.message : 'Failed to fetch revenue stats');
      // Use sample data as fallback
      setRevenueStats(getSampleRevenueStats());
      setServiceBreakdown(getSampleServiceBreakdown());
    } finally {
      setIsLoadingStats(false);
    }
  }, [getAuthToken]);

  const fetchRecentTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    setTransactionsError(null);
    
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.log('No auth token found, proceeding with API call anyway');
      }

      const response = await fetch('/api/partners/revenue/transactions', {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setRecentTransactions(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactionsError(error instanceof Error ? error.message : 'Failed to fetch transactions');
      // Use sample data as fallback
      setRecentTransactions(getSampleTransactions());
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [getAuthToken]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchRevenueData('30d'),
      fetchRevenueStats(),
      fetchRecentTransactions()
    ]);
  }, [fetchRevenueData, fetchRevenueStats, fetchRecentTransactions]);

  // Load initial data
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    // Data
    revenueData,
    revenueStats,
    serviceBreakdown,
    recentTransactions,
    
    // Loading states
    isLoadingRevenue,
    isLoadingStats,
    isLoadingTransactions,
    
    // Error states
    revenueError,
    statsError,
    transactionsError,
    
    // Actions
    fetchRevenueData,
    fetchRevenueStats,
    fetchRecentTransactions,
    refreshAll
  };
}
