// Card styling constants
export const CARD_STYLES = {
  container: 'hover:shadow-md transition-shadow',
  content: 'space-y-4',
  footer: 'pt-0',
} as const;

// Button styling constants
export const BUTTON_STYLES = {
  primary: 'w-full bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium',
  success: 'w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium',
  call: 'flex-1 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium',
  details: 'group border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium',
} as const;

// Task status constants
export const TASK_STATUS = {
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Task status labels
export const TASK_STATUS_LABELS = {
  [TASK_STATUS.ASSIGNED]: 'Assigned',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.COMPLETED]: 'Completed',
  [TASK_STATUS.CANCELLED]: 'Cancelled',
} as const;

// Action button labels
export const ACTION_LABELS = {
  START_TASK: 'Start Task',
  COMPLETE_TASK: 'Complete',
  CALL_NOW: 'Call Now',
  VIEW_DETAILS: 'Details',
} as const;
