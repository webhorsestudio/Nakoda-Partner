import React from 'react';
import { ClockIcon, CalendarIcon } from 'lucide-react';
import { formatDate } from '../utils/currencyUtils';
import CountdownTimer from './CountdownTimer';

interface OngoingTimeInfoProps {
  serviceDate?: string;
  serviceTime?: string;
  duration?: string;
  startTime?: string;
  estimatedEndTime?: string;
  actualStartTime?: string;
  status: 'in-progress' | 'completed' | 'cancelled' | 'assigned';
  onExpired?: () => void;
  onTaskCompleted?: (taskId: string) => void;
  taskId?: string;
}

export default function OngoingTimeInfo({ 
  serviceDate, 
  serviceTime, 
  duration,
  startTime,
  estimatedEndTime,
  actualStartTime,
  status,
  onExpired,
  onTaskCompleted,
  taskId
}: OngoingTimeInfoProps) {
  // Map time slot codes to human-readable time ranges
  const getTimeSlotDisplay = (slotCode?: string) => {
    if (!slotCode) return duration || 'Time TBD';
    
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
    
    // Fallback to duration or original value
    return duration || slotCode || 'Time TBD';
  };

  return (
    <div className="space-y-3">
      {/* Service Date */}
      <div className="flex items-center gap-3">
        <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">
            {formatDate(serviceDate || '')}
          </p>
        </div>
      </div>

      {/* Time Slot */}
      <div className="flex items-center gap-3">
        <ClockIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">
            {getTimeSlotDisplay(serviceTime)}
          </p>
        </div>
      </div>

      {/* Countdown Timer */}
      {serviceDate && serviceTime && status !== 'completed' && status !== 'cancelled' && (
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <CountdownTimer
              serviceDate={serviceDate}
              serviceTime={serviceTime}
              onExpired={onExpired}
              onTaskCompleted={onTaskCompleted}
              taskId={taskId}
              className="text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
