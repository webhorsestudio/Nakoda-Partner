export interface Task {
  id: string;
  title: string;
  description: string;
  customerName: string;
  customerPhone: string;
  location: string;
  amount: number;
  advanceAmount: number;
  serviceType: string;
  priority: string;
  estimatedDuration: string;
  createdAt: string;
  status: string;
  serviceDate?: string;
  timeSlot?: string;
}

export interface TaskFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export interface TaskCardProps {
  task: Task;
  onAcceptTask: (taskId: string) => void;
  onViewDetails: (taskId: string) => void;
  isAccepting?: boolean;
}
