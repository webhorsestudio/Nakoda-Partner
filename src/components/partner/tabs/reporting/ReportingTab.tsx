import React, { useState } from 'react';
import {
  ReportingHeader,
  TaskPerformanceTable
} from './';
import { usePartnerReporting } from '@/hooks/usePartnerReporting';

export default function ReportingTab() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  
  const {
    performanceMetrics,
    taskPerformance,
    isLoadingMetrics,
    isLoadingPerformance,
    metricsError,
    performanceError,
    refreshAll
  } = usePartnerReporting();

  const handleTimeRangeChange = async (range: string) => {
    setSelectedTimeRange(range);
    await refreshAll(range);
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
  if (metricsError || performanceError) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">
            {metricsError || performanceError}
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

      {/* Tables Section */}
      <div className="grid grid-cols-1 gap-8">
        {/* Task Performance Table */}
        <div>
          <TaskPerformanceTable 
            data={taskPerformance}
            isLoading={isLoadingPerformance}
          />
        </div>
      </div>
    </div>
  );
}
