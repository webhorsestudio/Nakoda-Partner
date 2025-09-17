import React, { useState, useEffect } from 'react';
import { ClockIcon, CheckCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateTimeDifference } from '../utils/dateTimeUtils';
import TaskCompletionModal from './TaskCompletionModal';

interface CountdownTimerProps {
  serviceDate: string;
  serviceTime: string;
  onExpired?: () => void;
  onTaskCompleted?: (taskId: string) => void;
  taskId?: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function CountdownTimer({ 
  serviceDate, 
  serviceTime, 
  onExpired,
  onTaskCompleted,
  taskId,
  className = ''
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTaskCompletedClick = () => {
    console.log('CountdownTimer - Task Completed clicked for task:', taskId);
    console.log('CountdownTimer - Setting showCompletionModal to true');
    setShowCompletionModal(true);
  };

  const handleModalSubmit = async (data: { feedback: string; image: File | null }) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting task completion:', { taskId, feedback: data.feedback, hasImage: !!data.image });
      
      // Prepare form data for API call
      const formData = new FormData();
      formData.append('feedback', data.feedback);
      if (data.image) {
        formData.append('images', data.image);
      }
      
      // Call the task completion API
      const response = await fetch(`/api/partners/orders/complete/${taskId}`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete task');
      }
      
      console.log('Task completion successful:', result);
      
      // Call the original callback
      onTaskCompleted?.(taskId || '');
      
      // Close modal
      setShowCompletionModal(false);
      
      // Show success message
      alert('Task completed successfully!');
    } catch (error) {
      console.error('Error completing task:', error);
      alert(`Failed to complete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    console.log('CountdownTimer - Closing modal');
    setShowCompletionModal(false);
  };

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft | null => {
      try {
        // Debug logging
        console.log('CountdownTimer - serviceDate:', serviceDate, 'serviceTime:', serviceTime);
        
        if (!serviceDate || !serviceTime) {
          console.log('CountdownTimer - Missing serviceDate or serviceTime');
          return null;
        }

        // Use utility function to calculate time difference
        const difference = calculateTimeDifference(serviceDate, serviceTime, 2);
        
        if (difference === null) {
          console.error('CountdownTimer - Failed to calculate time difference');
          return null;
        }

        console.log('CountdownTimer - difference:', difference);

        if (difference <= 0) {
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            total: 0
          };
        }

        const result = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          total: difference
        };

        console.log('CountdownTimer - result:', result);
        return result;
      } catch (error) {
        console.error('Error calculating countdown:', error, 'serviceDate:', serviceDate, 'serviceTime:', serviceTime);
        return null;
      }
    };

    const updateTimer = () => {
      const time = calculateTimeLeft();
      setTimeLeft(time);

      console.log('CountdownTimer - updateTimer:', { 
        timeTotal: time?.total, 
        isExpired, 
        shouldSetExpired: time && time.total <= 0 && !isExpired 
      });

      if (time && time.total <= 0 && !isExpired) {
        console.log('CountdownTimer - Setting expired state to true');
        setIsExpired(true);
        onExpired?.();
      }
    };

    // Initial calculation
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [serviceDate, serviceTime, onExpired]);

  // Check if timer should be expired on mount
  useEffect(() => {
    if (!serviceDate || !serviceTime) return;
    
    const difference = calculateTimeDifference(serviceDate, serviceTime, 2);
    if (difference !== null && difference <= 0) {
      console.log('CountdownTimer - Initial check: timer already expired');
      setIsExpired(true);
    }
  }, [serviceDate, serviceTime]);

  if (!timeLeft) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <ClockIcon className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Unable to calculate countdown</span>
        </div>
      </div>
    );
  }

  // Debug logging for button state
  console.log('CountdownTimer - Rendering check:', { 
    isExpired, 
    timeLeftTotal: timeLeft?.total, 
    shouldShowButton: isExpired || (timeLeft?.total <= 0),
    timeLeftObject: timeLeft,
    showCompletionModal
  });

  if (isExpired || timeLeft.total <= 0) {
    console.log('CountdownTimer - Showing Task Completed button', { isExpired, timeLeftTotal: timeLeft.total });
    return (
      <>
        <Button 
          onClick={handleTaskCompletedClick}
          className={`text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${className}`}
          style={{ backgroundColor: '#00008B' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#000066';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#00008B';
          }}
        >
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          Task Completed
        </Button>

        {/* Task Completion Modal */}
        <TaskCompletionModal
          isOpen={showCompletionModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          taskId={taskId || 'unknown'}
          isLoading={isSubmitting}
        />
      </>
    );
  }

  const formatTime = (value: number) => {
    if (isNaN(value) || !isFinite(value)) {
      return '00';
    }
    return value.toString().padStart(2, '0');
  };

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
          <ClockIcon className="w-5 h-5 text-blue-600" />
          <div className="flex items-center gap-1">
            {timeLeft.days > 0 && (
              <>
                <span className="font-mono font-bold text-lg text-blue-800 bg-white px-2 py-1 rounded shadow-sm">
                  {timeLeft.days}d
                </span>
                <span className="text-blue-600 font-bold text-lg">:</span>
              </>
            )}
            <span className="font-mono font-bold text-lg text-blue-800 bg-white px-2 py-1 rounded shadow-sm">
              {formatTime(timeLeft.hours)}h
            </span>
            <span className="text-blue-600 font-bold text-lg">:</span>
            <span className="font-mono font-bold text-lg text-blue-800 bg-white px-2 py-1 rounded shadow-sm">
              {formatTime(timeLeft.minutes)}m
            </span>
            <span className="text-blue-600 font-bold text-lg">:</span>
            <span className="font-mono font-bold text-lg text-blue-800 bg-white px-2 py-1 rounded shadow-sm">
              {formatTime(timeLeft.seconds)}s
            </span>
          </div>
        </div>
      </div>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        isOpen={showCompletionModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        taskId={taskId || 'unknown'}
        isLoading={isSubmitting}
      />
    </>
  );
}
