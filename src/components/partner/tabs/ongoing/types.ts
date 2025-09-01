export interface OngoingTask {
  id: string;
  title: string;
  customerName: string;
  location: string;
  amount: number;
  duration: string;
  serviceType: string;
  orderNumber: string;
  orderDate: string;
  serviceDate: string;
  serviceTime: string;
  status: 'in-progress' | 'completed' | 'cancelled';
  startTime?: string;
  estimatedEndTime?: string;
  actualStartTime?: string;
  currentPhase: string;
  notes?: string;
  photos?: string[];
  customerPhone: string;
  customerAddress: string;
  advanceAmount: number;
  balanceAmount: number;
  commissionAmount: number;
}

export interface OngoingTaskCardProps {
  task: OngoingTask;
  onViewDetails: (taskId: string) => void;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export interface OngoingTaskFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export interface OngoingTaskHeaderProps {
  totalTasks: number;
  activeTasks: number;
  completedToday: number;
}

export interface TaskStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}
