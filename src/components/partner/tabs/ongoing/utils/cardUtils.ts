import { OngoingTask } from '../types';

/**
 * Check if a task can be started
 */
export const canStartTask = (status: OngoingTask['status']): boolean => {
  return status === 'assigned';
};

/**
 * Check if a task can be completed
 */
export const canCompleteTask = (status: OngoingTask['status']): boolean => {
  return status === 'in-progress';
};

/**
 * Check if a task is completed
 */
export const isTaskCompleted = (status: OngoingTask['status']): boolean => {
  return status === 'completed';
};

/**
 * Check if a task is cancelled
 */
export const isTaskCancelled = (status: OngoingTask['status']): boolean => {
  return status === 'cancelled';
};

/**
 * Check if a task is active (assigned or in-progress)
 */
export const isTaskActive = (status: OngoingTask['status']): boolean => {
  return status === 'assigned' || status === 'in-progress';
};

/**
 * Get the appropriate button class based on whether customer phone is available
 */
export const getDetailsButtonClass = (hasCustomerPhone: boolean): string => {
  return hasCustomerPhone ? 'flex-1' : 'w-full';
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as Indian phone number if it starts with +91 or is 10 digits
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
};

/**
 * Validate if phone number is valid for calling
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
};
