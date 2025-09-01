import React, { useState } from 'react';
import {
  ReportingHeader,
  EarningsChart,
  TaskPerformanceTable,
  CustomerReviews,
  samplePerformanceMetrics,
  sampleEarningsData,
  sampleTaskPerformance,
  sampleCustomerReviews
} from './';

export default function ReportingTab() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    // TODO: Fetch data based on selected time range
    console.log('Time range changed to:', range);
  };

  const handleViewAllReviews = () => {
    console.log('View all reviews clicked');
    // TODO: Navigate to detailed reviews page
  };

  return (
    <div className="space-y-8">
      {/* Header with Metrics */}
      <ReportingHeader 
        metrics={samplePerformanceMetrics}
        selectedTimeRange={selectedTimeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />

      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Earnings Chart */}
        <div className="lg:col-span-2">
          <EarningsChart 
            data={sampleEarningsData}
            timeRange={selectedTimeRange}
          />
        </div>

        {/* Task Performance Table */}
        <div className="lg:col-span-2">
          <TaskPerformanceTable 
            data={sampleTaskPerformance}
          />
        </div>

        {/* Customer Reviews */}
        <div className="lg:col-span-1">
          <CustomerReviews 
            reviews={sampleCustomerReviews}
            onViewAll={handleViewAllReviews}
          />
        </div>
      </div>
    </div>
  );
}
