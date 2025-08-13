"use client";

import { useState, useEffect } from 'react';
import { ReportsHeader } from '@/components/reports/ReportsHeader';
import { ReportsFilters } from '@/components/reports/ReportsFilters';
import { ReportsSummaryCards } from '@/components/reports/ReportsSummaryCards';
import { ReportsCharts } from '@/components/reports/ReportsCharts';
import { ReportsDataTable } from '@/components/reports/ReportsDataTable';
import { useReports } from '@/hooks/useReports';
import { ReportFilters } from '@/types/reports';
import { exportToCSV, exportToPDF, exportToExcel } from '@/utils/exportUtils';
import { toast } from 'react-hot-toast';

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'last30days',
    startDate: '',
    endDate: '',
    status: 'all',
    city: 'all',
    partner: 'all',
    minAmount: '',
    maxAmount: ''
  });

  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting'>('idle');

  const {
    reportData,
    summaryStats,
    chartData,
    loading,
    error,
    fetchReports
  } = useReports();

  // Fetch reports when filters change
  useEffect(() => {
    fetchReports(filters);
  }, [filters, fetchReports]);

  const handleFiltersChange = (newFilters: Partial<ReportFilters>) => {
    setFilters((prev: ReportFilters) => ({ ...prev, ...newFilters }));
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      setExportStatus('exporting');
      
      // Show loading toast
      const loadingToast = toast.loading(`Exporting reports to ${format.toUpperCase()}...`);
      
      switch (format) {
        case 'csv':
          exportToCSV(reportData, summaryStats, chartData);
          toast.success('Reports exported to CSV successfully!');
          break;
        case 'pdf':
          await exportToPDF(reportData, summaryStats, chartData);
          toast.success('Reports exported to PDF successfully!');
          break;
        case 'excel':
          await exportToExcel(reportData, summaryStats, chartData);
          toast.success('Reports exported to Excel successfully!');
          break;
      }
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
    } catch (err) {
      toast.error(`Failed to export reports to ${format.toUpperCase()}. Please try again.`);
      console.error(`Export error (${format}):`, err);
    } finally {
      setExportStatus('idle');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Error Loading Reports</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ReportsHeader 
        loading={loading}
        onExport={handleExport}
        exportStatus={exportStatus}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Panel */}
        <ReportsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Summary Cards */}
        <div className="mb-8">
          <ReportsSummaryCards 
            stats={summaryStats}
            loading={loading}
          />
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <ReportsCharts 
            data={chartData}
            loading={loading}
          />
        </div>

        {/* Detailed Data Table */}
        <div className="mb-8">
          <ReportsDataTable 
            data={reportData}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
