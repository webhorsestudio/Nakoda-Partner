/**
 * Utility functions for parsing and formatting dates and times
 */

/**
 * Parse service date from various formats
 */
export function parseServiceDate(serviceDate: string): Date | null {
  if (!serviceDate) return null;

  try {
    // Check if already in ISO format
    if (serviceDate.includes('T') || serviceDate.includes('Z')) {
      return new Date(serviceDate);
    }

    // Handle YYYY-MM-DD format
    if (serviceDate.includes('-')) {
      return new Date(serviceDate);
    }

    // Handle YYYYMMDD format
    if (/^\d{8}$/.test(serviceDate)) {
      const year = serviceDate.substring(0, 4);
      const month = serviceDate.substring(4, 6);
      const day = serviceDate.substring(6, 8);
      return new Date(`${year}-${month}-${day}`);
    }

    // Try parsing as-is
    const parsed = new Date(serviceDate);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (error) {
    console.error('Error parsing service date:', error);
    return null;
  }
}

/**
 * Parse service time from various formats
 */
export function parseServiceTime(serviceTime: string): string | null {
  if (!serviceTime) return null;

  try {
    // Time slot code mapping
    const timeSlotMap: { [key: string]: string } = {
      '4972': '08:00', // 8:00AM - 10:00AM
      '4974': '10:00', // 10:00AM - 12:00PM
      '4976': '12:00', // 12:00PM - 2:00PM
      '4978': '14:00', // 2:00PM - 4:00PM
      '4980': '16:00', // 4:00PM - 6:00PM
      '4982': '18:00'  // 6:00PM - 8:00PM
    };

    // Check if it's a time slot code
    if (timeSlotMap[serviceTime]) {
      return timeSlotMap[serviceTime];
    }

    // Handle 12-hour format (e.g., "8:00AM", "2:30PM")
    if (serviceTime.includes('AM') || serviceTime.includes('PM')) {
      const [time, period] = serviceTime.split(' ');
      const [hours, minutes] = time.split(':');
      let hour24 = parseInt(hours);
      
      if (period === 'PM' && hour24 !== 12) hour24 += 12;
      if (period === 'AM' && hour24 === 12) hour24 = 0;
      
      return `${hour24.toString().padStart(2, '0')}:${minutes}`;
    }

    // Handle time range (e.g., "8:00AM - 10:00AM")
    if (serviceTime.includes(' - ')) {
      const startTime = serviceTime.split(' - ')[0];
      return parseServiceTime(startTime);
    }

    // Handle 24-hour format (e.g., "14:30")
    if (/^\d{1,2}:\d{2}$/.test(serviceTime)) {
      const [hours, minutes] = serviceTime.split(':');
      return `${hours.padStart(2, '0')}:${minutes}`;
    }

    // Try parsing as-is
    return serviceTime;
  } catch (error) {
    console.error('Error parsing service time:', error);
    return null;
  }
}

/**
 * Create a service datetime from date and time strings
 */
export function createServiceDateTime(serviceDate: string, serviceTime: string): Date | null {
  const parsedDate = parseServiceDate(serviceDate);
  const parsedTime = parseServiceTime(serviceTime);

  if (!parsedDate || !parsedTime) {
    return null;
  }

  try {
    const dateStr = parsedDate.toISOString().split('T')[0];
    const serviceDateTime = new Date(`${dateStr}T${parsedTime}:00`);
    
    return isNaN(serviceDateTime.getTime()) ? null : serviceDateTime;
  } catch (error) {
    console.error('Error creating service datetime:', error);
    return null;
  }
}

/**
 * Calculate time difference in milliseconds
 */
export function calculateTimeDifference(serviceDate: string, serviceTime: string, durationHours: number = 2): number | null {
  const serviceDateTime = createServiceDateTime(serviceDate, serviceTime);
  
  if (!serviceDateTime) {
    return null;
  }

  try {
    const endDateTime = new Date(serviceDateTime.getTime() + (durationHours * 60 * 60 * 1000));
    const now = new Date();
    
    return endDateTime.getTime() - now.getTime();
  } catch (error) {
    console.error('Error calculating time difference:', error);
    return null;
  }
}
