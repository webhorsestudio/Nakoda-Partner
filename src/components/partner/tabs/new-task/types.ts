export interface Task {
  id: string;
  title: string;
  customerName: string;
  location: string;
  amount: number;
  duration: string;
  serviceType: string;
  priority: string;
  isExclusive: boolean;
  countdown: string;
  description: string;
  requirements: string;
  advanceAmount: number;
  commission: string;
}

export interface TaskFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export interface TaskCardProps {
  task: Task;
  onAcceptTask: (taskId: string) => void;
  onViewDetails: (taskId: string) => void;
}
