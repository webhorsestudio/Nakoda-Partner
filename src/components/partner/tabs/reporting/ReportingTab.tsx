import React, { useState } from 'react';
import {
  ReportingHeader,
  EarningsChart,
  TaskPerformanceTable
} from './';
import { usePartnerReporting } from '@/hooks/usePartnerReporting';

export default function ReportingTab() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  
  const {
    performanceMetrics,
    earningsData,
    taskPerformance,
    isLoadingMetrics,
    isLoadingEarnings,
    isLoadingPerformance,
    metricsError,
    earningsError,
    performanceError,
    fetchEarnings,
    refreshAll
  } = usePartnerReporting();

  const handleTimeRangeChange = async (range: string) => {
    setSelectedTimeRange(range);
    await fetchEarnings(range);
  };



  // Show loading state for initial load
  if (isLoadingMetrics && !performanceMetrics) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-32 bg-slate-200 rounded-lg mb-8"></div>
          <div className="h-96 bg-slate-200 rounded-lg mb-8"></div>
          <div className="h-64 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (metricsError || earningsError || performanceError) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">
            {metricsError || earningsError || performanceError}
          </p>
          <button
            onClick={() => refreshAll(selectedTimeRange)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Metrics */}
      {performanceMetrics && (
        <ReportingHeader 
          metrics={performanceMetrics}
          selectedTimeRange={selectedTimeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />
      )}

      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Earnings Chart */}
        <div className="lg:col-span-2">
          <EarningsChart 
            data={earningsData}
            timeRange={selectedTimeRange}
            isLoading={isLoadingEarnings}
          />
        </div>

        {/* Task Performance Table */}
        <div className="lg:col-span-2">
          <TaskPerformanceTable 
            data={taskPerformance}
            isLoading={isLoadingPerformance}
          />
        </div>
      </div>
    </div>
  );
}
