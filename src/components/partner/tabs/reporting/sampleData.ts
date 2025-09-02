import { PerformanceMetrics, EarningsData, TaskPerformance } from './types';

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

export const sampleEarningsData: EarningsData[] = [
  { date: '2025-01-01', earnings: 1200, tasks: 3, commission: 300 },
  { date: '2025-01-02', earnings: 1800, tasks: 4, commission: 450 },
  { date: '2025-01-03', earnings: 2100, tasks: 5, commission: 525 },
  { date: '2025-01-04', earnings: 1600, tasks: 3, commission: 400 },
  { date: '2025-01-05', earnings: 2400, tasks: 6, commission: 600 },
  { date: '2025-01-06', earnings: 1900, tasks: 4, commission: 475 },
  { date: '2025-01-07', earnings: 2200, tasks: 5, commission: 550 },
  { date: '2025-01-08', earnings: 2800, tasks: 7, commission: 700 },
  { date: '2025-01-09', earnings: 3200, tasks: 8, commission: 800 },
  { date: '2025-01-10', earnings: 2600, tasks: 6, commission: 650 },
  { date: '2025-01-11', earnings: 3000, tasks: 7, commission: 750 },
  { date: '2025-01-12', earnings: 3400, tasks: 8, commission: 850 },
  { date: '2025-01-13', earnings: 2900, tasks: 7, commission: 725 },
  { date: '2025-01-14', earnings: 3100, tasks: 8, commission: 775 },
  { date: '2025-01-15', earnings: 2700, tasks: 6, commission: 675 },
  { date: '2025-01-16', earnings: 2300, tasks: 5, commission: 575 },
  { date: '2025-01-17', earnings: 3500, tasks: 9, commission: 875 },
  { date: '2025-01-18', earnings: 2800, tasks: 7, commission: 700 },
  { date: '2025-01-19', earnings: 2100, tasks: 5, commission: 525 },
  { date: '2025-01-20', earnings: 1900, tasks: 4, commission: 475 },
  { date: '2025-01-21', earnings: 2500, tasks: 6, commission: 625 },
  { date: '2025-01-22', earnings: 3200, tasks: 8, commission: 800 },
  { date: '2025-01-23', earnings: 2900, tasks: 7, commission: 725 },
  { date: '2025-01-24', earnings: 2400, tasks: 6, commission: 600 },
  { date: '2025-01-25', earnings: 1800, tasks: 4, commission: 450 },
  { date: '2025-01-26', earnings: 2200, tasks: 5, commission: 550 },
  { date: '2025-01-27', earnings: 2600, tasks: 6, commission: 650 },
  { date: '2025-01-28', earnings: 3000, tasks: 7, commission: 750 },
  { date: '2025-01-29', earnings: 2800, tasks: 7, commission: 700 },
  { date: '2025-01-30', earnings: 3100, tasks: 8, commission: 775 }
];

export const sampleTaskPerformance: TaskPerformance[] = [
  {
    serviceType: 'Cleaning',
    totalTasks: 35,
    completedTasks: 34,
    averageRating: 4.9,
    totalEarnings: 18200
  },
  {
    serviceType: 'Plumbing',
    totalTasks: 28,
    completedTasks: 27,
    averageRating: 4.7,
    totalEarnings: 15600
  },
  {
    serviceType: 'Electrical',
    totalTasks: 18,
    completedTasks: 18,
    averageRating: 4.8,
    totalEarnings: 9800
  },
  {
    serviceType: 'Carpentry',
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
