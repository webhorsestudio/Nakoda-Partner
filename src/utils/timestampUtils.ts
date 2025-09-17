/**
 * Utility functions for handling timestamp fields in forms and API requests
 */

/**
 * Converts a datetime-local input value to ISO string or null
 * @param value - The datetime-local input value
 * @returns ISO string or null
 */
export function parseDateTimeLocal(value: string | null | undefined): string | undefined {
  if (!value || value.trim() === '') {
    return undefined;
  }
  
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return undefined;
    }
    return date.toISOString();
  } catch {
    return undefined;
  }
}

/**
 * Converts an ISO string to datetime-local input value
 * @param value - The ISO string value
 * @returns datetime-local input value or empty string
 */
export function formatDateTimeLocal(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

/**
 * Cleans data for database operations by converting empty strings to null for timestamp fields
 * @param data - The data object to clean
 * @param timestampFields - Array of field names that should be timestamps
 * @returns Cleaned data object
 */
export function cleanTimestampFields<T extends Record<string, unknown>>(
  data: T,
  timestampFields: string[] = ['expires_at', 'created_at', 'updated_at']
): T {
  const cleaned = { ...data } as Record<string, unknown>;
  
  timestampFields.forEach(field => {
    if (field in cleaned && cleaned[field] === '') {
      cleaned[field] = null;
    }
  });
  
  return cleaned as T;
}

/**
 * Validates a timestamp string
 * @param value - The timestamp value to validate
 * @returns True if valid, false otherwise
 */
export function isValidTimestamp(value: string | null | undefined): boolean {
  if (!value) {
    return true; // null/undefined is valid for optional timestamps
  }
  
  try {
    const date = new Date(value);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}
