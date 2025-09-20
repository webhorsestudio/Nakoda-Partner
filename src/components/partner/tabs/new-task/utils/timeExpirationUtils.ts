// Time-based expiration utilities for new task cards
// This handles automatic removal of tasks when their timeslot start time is reached

export interface TimeSlotInfo {
  startTime: string; // e.g., "8:00AM"
  endTime: string;   // e.g., "10:00AM"
  displayText: string; // e.g., "8:00AM - 10:00AM"
  startTimeInMinutes: number; // e.g., 480 (8:00 AM in minutes from midnight)
  endTimeInMinutes: number;   // e.g., 600 (10:00 AM in minutes from midnight)
}

// Time slot code mapping to human-readable times
const TIME_SLOT_MAP: { [key: string]: TimeSlotInfo } = {
  '4972': {
    startTime: '8:00AM',
    endTime: '10:00AM',
    displayText: '8:00AM - 10:00AM',
    startTimeInMinutes: 480,  // 8:00 AM
    endTimeInMinutes: 600     // 10:00 AM
  },
  '4974': {
    startTime: '10:00AM',
    endTime: '12:00PM',
    displayText: '10:00AM - 12:00PM',
    startTimeInMinutes: 600,  // 10:00 AM
    endTimeInMinutes: 720     // 12:00 PM
  },
  '4976': {
    startTime: '12:00PM',
    endTime: '2:00PM',
    displayText: '12:00PM - 2:00PM',
    startTimeInMinutes: 720,  // 12:00 PM
    endTimeInMinutes: 840     // 2:00 PM
  },
  '4978': {
    startTime: '2:00PM',
    endTime: '4:00PM',
    displayText: '2:00PM - 4:00PM',
    startTimeInMinutes: 840,  // 2:00 PM
    endTimeInMinutes: 960     // 4:00 PM
  },
  '4980': {
    startTime: '4:00PM',
    endTime: '6:00PM',
    displayText: '4:00PM - 6:00PM',
    startTimeInMinutes: 960,  // 4:00 PM
    endTimeInMinutes: 1080    // 6:00 PM
  },
  '4982': {
    startTime: '6:00PM',
    endTime: '8:00PM',
    displayText: '6:00PM - 8:00PM',
    startTimeInMinutes: 1080, // 6:00 PM
    endTimeInMinutes: 1200    // 8:00 PM
  }
};

/**
 * Parse a time slot code or string to get time information
 */
export function parseTimeSlot(timeSlot?: string): TimeSlotInfo | null {
  if (!timeSlot) return null;

  // Check if it's a known code
  if (TIME_SLOT_MAP[timeSlot]) {
    return TIME_SLOT_MAP[timeSlot];
  }

  // Check if it's already a readable time format like "8:00AM - 10:00AM"
  const timeRangeMatch = timeSlot.match(/(\d{1,2}:\d{2}(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}(?:AM|PM))/i);
  if (timeRangeMatch) {
    const startTime = timeRangeMatch[1].toUpperCase();
    const endTime = timeRangeMatch[2].toUpperCase();
    
    return {
      startTime,
      endTime,
      displayText: `${startTime} - ${endTime}`,
      startTimeInMinutes: timeToMinutes(startTime),
      endTimeInMinutes: timeToMinutes(endTime)
    };
  }

  // Check if it's a single time like "8:00AM"
  const singleTimeMatch = timeSlot.match(/(\d{1,2}:\d{2}(?:AM|PM))/i);
  if (singleTimeMatch) {
    const time = singleTimeMatch[1].toUpperCase();
    return {
      startTime: time,
      endTime: time,
      displayText: time,
      startTimeInMinutes: timeToMinutes(time),
      endTimeInMinutes: timeToMinutes(time)
    };
  }

  return null;
}

/**
 * Convert time string (e.g., "8:00AM") to minutes from midnight
 */
function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d{1,2}):(\d{2})(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();

  // Convert to 24-hour format
  if (period === 'AM' && hours === 12) {
    hours = 0;
  } else if (period === 'PM' && hours !== 12) {
    hours += 12;
  }

  return hours * 60 + minutes;
}

/**
 * Get current time in minutes from midnight
 */
export function getCurrentTimeInMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Check if a task has expired based on its timeslot
 */
export function isTaskExpired(timeSlot?: string, serviceDate?: string): boolean {
  if (!timeSlot) return false;

  const timeInfo = parseTimeSlot(timeSlot);
  if (!timeInfo) return false;

  // If service date is provided, check if it's today
  if (serviceDate) {
    const today = new Date().toISOString().split('T')[0];
    const taskDate = new Date(serviceDate).toISOString().split('T')[0];
    
    // If task is not for today, it's not expired yet
    if (taskDate !== today) {
      return false;
    }
  }

  const currentTime = getCurrentTimeInMinutes();
  const startTime = timeInfo.startTimeInMinutes;

  // Task is expired if current time has reached or passed the start time
  return currentTime >= startTime;
}

/**
 * Get time remaining until task expires (in minutes)
 */
export function getTimeUntilExpiration(timeSlot?: string, serviceDate?: string): number | null {
  if (!timeSlot) return null;

  const timeInfo = parseTimeSlot(timeSlot);
  if (!timeInfo) return null;

  // If service date is provided, check if it's today
  if (serviceDate) {
    const today = new Date().toISOString().split('T')[0];
    const taskDate = new Date(serviceDate).toISOString().split('T')[0];
    
    // If task is not for today, return null (not applicable)
    if (taskDate !== today) {
      return null;
    }
  }

  const currentTime = getCurrentTimeInMinutes();
  const startTime = timeInfo.startTimeInMinutes;

  // Return minutes until expiration (negative if already expired)
  return startTime - currentTime;
}

/**
 * Format time remaining in a human-readable way
 */
export function formatTimeRemaining(minutes: number): string {
  if (minutes <= 0) return 'Expired';
  if (minutes < 60) return `${minutes}m remaining`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h remaining`;
  }
  
  return `${hours}h ${remainingMinutes}m remaining`;
}

/**
 * Get all time slot codes for reference
 */
export function getAllTimeSlots(): { [key: string]: TimeSlotInfo } {
  return { ...TIME_SLOT_MAP };
}
