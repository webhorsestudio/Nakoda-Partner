export { default as OngoingTaskHeader } from './OngoingTaskHeader';
export { default as TaskFilters } from './TaskFilters';
export { default as OngoingTaskCard } from './OngoingTaskCard';
export { default as EmptyState } from './EmptyState';
export { default as TaskStatusBadge } from './TaskStatusBadge';
export { default as OngoingTaskTab } from './OngoingTaskTab';
export { default as OngoingTaskContainer } from './OngoingTaskContainer';
export { default as OngoingTaskPresentation } from './OngoingTaskPresentation';
export { default as TaskGrid } from './TaskGrid';
export { default as LoadingState } from './LoadingState';
export { default as ErrorState } from './ErrorState';
export { default as NotificationBanner } from './NotificationBanner';
export { sampleOngoingTasks } from './sampleData';

// Export components from components directory
export * from './components';

// Export hooks
export * from './hooks';

// Export utils
export * from './utils';

export type { 
  OngoingTask, 
  OngoingTaskCardProps, 
  OngoingTaskFiltersProps, 
  OngoingTaskHeaderProps,
  TaskStatusBadgeProps
} from './types';
