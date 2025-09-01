import React from 'react';
import { 
  DollarSignIcon, 
  CheckCircleIcon, 
  StarIcon, 
  ClockIcon,
  UsersIcon,
  AwardIcon,
  TargetIcon
} from 'lucide-react';
import { ReportingHeaderProps } from './types';
import MetricsCard from './MetricsCard';
import TimeRangeSelector from './TimeRangeSelector';

export default function ReportingHeader({ metrics, selectedTimeRange, onTimeRangeChange }: ReportingHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Performance Reports</h1>
          <p className="text-slate-600 mt-1">Track your performance and earnings</p>
        </div>
      </div>

      {/* Time Range Selector */}
      <TimeRangeSelector 
        selectedRange={selectedTimeRange}
        onRangeChange={onTimeRangeChange}
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Earnings"
          value={metrics.totalEarnings}
          subtitle="This period"
          icon={<DollarSignIcon className="w-5 h-5" />}
          trend={{ value: 12, isPositive: true }}
          color="green"
        />
        
        <MetricsCard
          title="Completed Tasks"
          value={metrics.completedTasks}
          subtitle={`of ${metrics.totalTasks} total`}
          icon={<CheckCircleIcon className="w-5 h-5" />}
          trend={{ value: 8, isPositive: true }}
          color="blue"
        />
        
        <MetricsCard
          title="Average Rating"
          value={`${metrics.averageRating}/5`}
          subtitle={`${metrics.totalReviews} reviews`}
          icon={<StarIcon className="w-5 h-5" />}
          trend={{ value: 5, isPositive: true }}
          color="purple"
        />
        
        <MetricsCard
          title="Active Hours"
          value={metrics.activeHours}
          subtitle="This period"
          icon={<ClockIcon className="w-5 h-5" />}
          trend={{ value: 15, isPositive: true }}
          color="orange"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricsCard
          title="Customer Satisfaction"
          value={`${metrics.customerSatisfaction}%`}
          subtitle="Happy customers"
          icon={<UsersIcon className="w-5 h-5" />}
          color="green"
        />
        
        <MetricsCard
          title="On-Time Completion"
          value={`${metrics.onTimeCompletion}%`}
          subtitle="Tasks completed on time"
          icon={<TargetIcon className="w-5 h-5" />}
          color="blue"
        />
        
        <MetricsCard
          title="Performance Score"
          value="Excellent"
          subtitle="Based on all metrics"
          icon={<AwardIcon className="w-5 h-5" />}
          color="purple"
        />
      </div>
    </div>
  );
}
