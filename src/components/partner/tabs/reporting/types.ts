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

export interface EarningsData {
  date: string;
  earnings: number;
  tasks: number;
  commission: number;
}

export interface TaskPerformance {
  serviceType: string;
  totalTasks: number;
  completedTasks: number;
  averageRating: number;
  totalEarnings: number;
}



export interface TimeRange {
  label: string;
  value: string;
  days: number;
}

export interface ReportingHeaderProps {
  metrics: PerformanceMetrics;
  selectedTimeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export interface EarningsChartProps {
  data: EarningsData[];
  timeRange: string;
  isLoading?: boolean;
}

export interface TaskPerformanceTableProps {
  data: TaskPerformance[];
  isLoading?: boolean;
}



export interface TimeRangeSelectorProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
}
