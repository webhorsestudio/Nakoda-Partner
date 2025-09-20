import React from 'react';
import { ClockIcon, CalendarIcon, AlertTriangleIcon } from 'lucide-react';
import { formatDate } from '../utils/currencyUtils';
import { getTimeUntilExpiration, formatTimeRemaining, parseTimeSlot } from '../utils/timeExpirationUtils';

interface TimeInfoProps {
  serviceDate?: string;
  timeSlot?: string;
  estimatedDuration?: string; // Keep as fallback
}

export default function TimeInfo({ serviceDate, timeSlot, estimatedDuration }: TimeInfoProps) {
  // Get time slot information
  const timeSlotInfo = parseTimeSlot(timeSlot);
  const timeRemaining = getTimeUntilExpiration(timeSlot, serviceDate);
  
  // Map time slot codes to human-readable time ranges
  const getTimeSlotDisplay = (slotCode?: string) => {
    if (!slotCode) return estimatedDuration || 'Time TBD';
    
    const timeSlotMap: { [key: string]: string } = {
      '4972': '8:00AM - 10:00AM',
      '4974': '10:00AM - 12:00PM', 
      '4976': '12:00PM - 2:00PM',
      '4978': '2:00PM - 4:00PM',
      '4980': '4:00PM - 6:00PM',
      '4982': '6:00PM - 8:00PM'
    };
    
    const mappedTime = timeSlotMap[slotCode];
    if (mappedTime) {
      return mappedTime;
    }
    
    // If it's not a known code, check if it's already a readable time format
    if (slotCode.includes('AM') || slotCode.includes('PM') || slotCode.includes('-')) {
      return slotCode;
    }
    
    // Fallback to estimated duration or original value
    return estimatedDuration || slotCode || 'Time TBD';
  };
  
  // Format service date for display
  const formatServiceDate = (dateString?: string) => {
    if (!dateString) return 'Date TBD';
    
    // If it's already a readable string (like "Tomorrow", "Next Week", etc.), return as is
    if (typeof dateString === 'string' && !dateString.match(/^\d{4}-\d{2}-\d{2}/) && !dateString.match(/^\d{2}\/\d{2}\/\d{4}/)) {
      return dateString;
    }
    
    try {
      // Handle various date formats that might come from the database
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        // If it's not a valid date, return as is
        return dateString;
      }
      
      const formatted = date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      return formatted;
    } catch (error) {
      // If parsing fails, return the original string
      return dateString;
    }
  };

  return (
    <div className="space-y-3">
      {/* Service Date */}
      <div className="flex items-center gap-3">
        <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">
            {formatServiceDate(serviceDate)}
          </p>
        </div>
      </div>

      {/* Time Slot */}
      <div className="flex items-center gap-3">
        <ClockIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">
            {getTimeSlotDisplay(timeSlot)}
          </p>
          {/* Time remaining indicator */}
          {timeRemaining !== null && (
            <div className={`flex items-center gap-1 mt-1 ${
              timeRemaining <= 0 
                ? 'text-red-600' 
                : timeRemaining <= 30 
                  ? 'text-orange-600' 
                  : 'text-green-600'
            }`}>
              <AlertTriangleIcon className="w-3 h-3" />
              <span className="text-xs font-medium">
                {formatTimeRemaining(timeRemaining)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
