/**
 * Time Slot Conversion Utility
 * Converts numeric time slot codes to human-readable time ranges
 */

export interface TimeSlotMapping {
  code: string;
  timeRange: string;
}

export const TIME_SLOT_MAPPINGS: TimeSlotMapping[] = [
  { code: "4972", timeRange: "8:00AM - 10:00AM" },
  { code: "4974", timeRange: "10:00AM - 12:00PM" },
  { code: "4976", timeRange: "12:00PM - 2:00PM" },
  { code: "4978", timeRange: "2:00PM - 4:00PM" },
  { code: "4980", timeRange: "4:00PM - 6:00PM" },
  { code: "4982", timeRange: "6:00PM - 8:00PM" }
];

/**
 * Convert numeric time slot code to human-readable time range
 * @param timeSlotCode - The numeric code (e.g., "4976")
 * @returns Human-readable time range (e.g., "12:00PM - 2:00PM") or fallback
 */
export function convertTimeSlot(timeSlotCode: string | null | undefined): string {
  console.log(`🕐 convertTimeSlot called with:`, {
    input: timeSlotCode,
    type: typeof timeSlotCode,
    isNull: timeSlotCode === null,
    isUndefined: timeSlotCode === undefined,
    isEmpty: timeSlotCode === '',
    length: timeSlotCode?.length
  });
  
  if (!timeSlotCode) {
    console.log(`🕐 convertTimeSlot: No time slot code provided, returning "Morning Slot"`);
    return "Morning Slot"; // Default fallback
  }

  // Clean the code (remove any whitespace)
  const cleanCode = timeSlotCode.toString().trim();

  // Find matching time slot
  const mapping = TIME_SLOT_MAPPINGS.find(slot => slot.code === cleanCode);
  
  if (mapping) {
    console.log(`🕐 convertTimeSlot: Found mapping for "${cleanCode}" → "${mapping.timeRange}"`);
    return mapping.timeRange;
  }

  // If no mapping found, check if it's already a readable format
  if (cleanCode.includes("AM") || cleanCode.includes("PM") || cleanCode.includes(":")) {
    console.log(`🕐 convertTimeSlot: Code "${cleanCode}" appears to be already readable format`);
    return cleanCode;
  }

  // Default fallback for unknown codes
  console.warn(`⚠️ convertTimeSlot: Unknown time slot code: "${cleanCode}", returning "Morning Slot"`);
  return "Morning Slot";
}

/**
 * Get all available time slots
 * @returns Array of all time slot mappings
 */
export function getAllTimeSlots(): TimeSlotMapping[] {
  return TIME_SLOT_MAPPINGS;
}

/**
 * Check if a time slot code is valid
 * @param timeSlotCode - The numeric code to validate
 * @returns True if valid, false otherwise
 */
export function isValidTimeSlotCode(timeSlotCode: string | null | undefined): boolean {
  if (!timeSlotCode) return false;
  
  const cleanCode = timeSlotCode.toString().trim();
  return TIME_SLOT_MAPPINGS.some(slot => slot.code === cleanCode);
}
