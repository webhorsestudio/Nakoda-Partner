export interface OngoingTask {
  id: string;
  title: string;
  description?: string;
  package?: string; // Package field from database
  customerName: string;
  location: string;
  amount: number;
  duration: string;
  serviceType: string;
  orderNumber: string;
  orderDate: string;
  serviceDate: string;
  serviceTime: string;
  status: 'in-progress' | 'completed' | 'cancelled' | 'assigned';
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
  mode?: string | null; // Payment mode (COD, online, etc.)
  isCompleted?: boolean; // New field to track completion state
  isExpired?: boolean; // New field to track expiration state
}

export interface OngoingTaskCardProps {
  task: OngoingTask;
  onViewDetails: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onTaskExpired?: (taskId: string) => void;
  onTaskCompleted?: (taskId: string) => void;
}

export interface OngoingTaskFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  availableFilters: Array<{ id: string; label: string }>;
}

export interface OngoingTaskHeaderProps {
  totalTasks: number;
}

export interface TaskStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}
