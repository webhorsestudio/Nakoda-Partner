/**
 * Time Slot Mapping Utility
 * Maps Bitrix24 service slot IDs to human-readable time ranges
 */

export interface TimeSlotMapping {
  id: string;
  timeRange: string;
  startTime: string;
  endTime: string;
}

export const TIME_SLOT_MAPPINGS: TimeSlotMapping[] = [
  { id: "4972", timeRange: "8:00AM - 10:00AM", startTime: "8:00AM", endTime: "10:00AM" },
  { id: "4974", timeRange: "10:00AM - 12:00PM", startTime: "10:00AM", endTime: "12:00PM" },
  { id: "4976", timeRange: "12:00PM - 2:00PM", startTime: "12:00PM", endTime: "2:00PM" },
  { id: "4978", timeRange: "2:00PM - 4:00PM", startTime: "2:00PM", endTime: "4:00PM" },
  { id: "4980", timeRange: "4:00PM - 6:00PM", startTime: "4:00PM", endTime: "6:00PM" },
  { id: "4982", timeRange: "6:00PM - 8:00PM", startTime: "6:00PM", endTime: "8:00PM" },
];

/**
 * Converts a service slot ID to human-readable time range
 */
export function getTimeSlotDisplay(slotId: string | null | undefined): string {
  if (!slotId) return 'N/A';
  
  // Check if it's a numeric ID that we can map
  if (/^\d+$/.test(slotId)) {
    const mapping = TIME_SLOT_MAPPINGS.find(m => m.id === slotId);
    if (mapping) {
      return mapping.timeRange;
    }
  }
  
  // If it's already a human-readable time, return as is
  if (typeof slotId === 'string' && slotId.includes(':')) {
    return slotId;
  }
  
  // If it's a numeric ID we don't recognize, return as is
  return slotId;
}

/**
 * Gets the time slot mapping for a given ID
 */
export function getTimeSlotMapping(slotId: string): TimeSlotMapping | null {
  return TIME_SLOT_MAPPINGS.find(m => m.id === slotId) || null;
}

/**
 * Checks if a time slot ID is valid
 */
export function isValidTimeSlotId(slotId: string): boolean {
  // Filter out invalid values like "0", "", etc.
  if (!slotId || slotId === "0" || slotId === "" || slotId === "null") {
    return false;
  }
  return TIME_SLOT_MAPPINGS.some(m => m.id === slotId);
}

/**
 * Filters out invalid time slot values
 */
export function filterValidTimeSlot(slotId: string | null | undefined): string | null {
  if (!slotId || slotId === "0" || slotId === "" || slotId === "null") {
    return null;
  }
  return slotId;
}

/**
 * Formats a service date with time slot for display
 */
export function formatServiceDateTime(timeSlot: string | null | undefined, serviceDate: string | null | undefined): string {
  // Filter out invalid time slot values first
  const validTimeSlot = filterValidTimeSlot(timeSlot);
  
  // If we have a valid time slot, process it first
  if (validTimeSlot) {
    // If time slot is numeric, try to map it
    if (/^\d+$/.test(validTimeSlot)) {
      const mapping = getTimeSlotMapping(validTimeSlot);
      if (mapping) {
        return mapping.timeRange; // Return the mapped time range
      }
      
      // If we can't map it, fall back to service date or warning
      if (serviceDate) {
        try {
          const date = new Date(serviceDate);
          if (!isNaN(date.getTime())) {
            return `Service Date: ${date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}`;
          }
        } catch {
          // Invalid date, continue to fallback
        }
      }
      
      return '⚠️ Time Information Required';
    }
    
    // If it's already a human-readable time, return as is
    if (typeof validTimeSlot === 'string' && validTimeSlot.includes(':')) {
      return validTimeSlot;
    }
    
    // For any other format, return as is
    return validTimeSlot;
  }
  
  // If no valid time slot, try to show service date
  if (serviceDate) {
    try {
      const date = new Date(serviceDate);
      if (!isNaN(date.getTime())) {
        return `Service Date: ${date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`;
      }
    } catch {
      // Invalid date, continue to fallback
    }
  }
  
  return '⚠️ Time Information Required';
}
