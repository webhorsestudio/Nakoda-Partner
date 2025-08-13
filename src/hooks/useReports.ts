import { useState, useCallback } from 'react';
import { ReportFilters, SummaryStats, ChartData, ReportData } from '@/types/reports';

export function useReports() {
  const [reportData, setReportData] = useState<ReportData>({
    items: [],
    totalCount: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });
  
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    ordersThisMonth: 0,
    revenueThisMonth: 0,
    completionRate: 0,
    newOrdersToday: 0,
    pendingOrders: 0
  });
  
  const [chartData, setChartData] = useState<ChartData>({
    ordersByStatus: [],
    ordersByMonth: [],
    ordersByCity: [],
    ordersByPartner: [],
    revenueTrend: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (filters: ReportFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch reports data from API
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports data');
      }

      const data = await response.json();
      
      setReportData(data.reportData);
      setSummaryStats(data.summaryStats);
      setChartData(data.chartData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reportData,
    summaryStats,
    chartData,
    loading,
    error,
    fetchReports
  };
}
