import { PerformanceMetrics, TaskPerformance } from './types';

export const samplePerformanceMetrics: PerformanceMetrics = {
  totalEarnings: 45600,
  totalTasks: 89,
  completedTasks: 87,
  averageRating: 4.8,
  totalReviews: 67,
  activeHours: 342,
  customerSatisfaction: 96,
  onTimeCompletion: 94
};


export const sampleTaskPerformance: TaskPerformance[] = [
  {
    serviceType: 'Package: Deep Cleaning Service By : ABC Company',
    totalTasks: 35,
    completedTasks: 34,
    averageRating: 4.9,
    totalEarnings: 18200
  },
  {
    serviceType: 'Package: Plumbing Repair Service By : XYZ Services',
    totalTasks: 28,
    completedTasks: 27,
    averageRating: 4.7,
    totalEarnings: 15600
  },
  {
    serviceType: 'Package: Electrical Installation Service By : DEF Electric',
    totalTasks: 18,
    completedTasks: 18,
    averageRating: 4.8,
    totalEarnings: 9800
  },
  {
    serviceType: 'Package: Carpentry Work Service By : GHI Woodworks',
    totalTasks: 8,
    completedTasks: 8,
    averageRating: 4.6,
    totalEarnings: 2000
  }
];



export const timeRanges = [
  { label: 'Last 7 Days', value: '7d', days: 7 },
  { label: 'Last 30 Days', value: '30d', days: 30 },
  { label: 'Last 3 Months', value: '3m', days: 90 },
  { label: 'Last 6 Months', value: '6m', days: 180 },
  { label: 'Last Year', value: '1y', days: 365 }
];
