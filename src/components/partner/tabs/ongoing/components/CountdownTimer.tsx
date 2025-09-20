import React, { useState, useEffect } from 'react';
import { ClockIcon, CheckCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateTimeDifference } from '../utils/dateTimeUtils';
import TaskCompletionModal from './TaskCompletionModal';
import { toast } from 'react-hot-toast';

interface CountdownTimerProps {
  serviceDate: string;
  serviceTime: string;
  onExpired?: () => void;
  onTaskCompleted?: (taskId: string) => void;
  onTaskExpired?: (taskId: string) => void;
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
  onTaskExpired,
  taskId,
  className = ''
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTaskCompletedClick = () => {
    setShowCompletionModal(true);
  };

  const handleModalSubmit = async (data: { customerRating: number; image: File | null }) => {
    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToast = toast.loading('Completing task...', {
      duration: 0, // Don't auto-dismiss
    });
    
    try {
      
      // Prepare form data for API call
      const formData = new FormData();
      formData.append('customerRating', data.customerRating.toString());
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
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Call the original callback to update parent state
      onTaskCompleted?.(taskId || '');
      
      // Close modal
      setShowCompletionModal(false);
      
      // Show success message with wallet refund info if applicable
      if (result.data?.walletRefund?.refunded) {
        const refund = result.data.walletRefund;
        toast.success(`Task completed successfully! ₹${refund.amount} advance amount refunded to your wallet.`, {
          duration: 5000,
          icon: '💰',
        });
      } else {
        toast.success('Task completed successfully!', {
          duration: 4000,
          icon: '✅',
        });
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      toast.error(`Failed to complete task: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowCompletionModal(false);
  };

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft | null => {
      try {
        if (!serviceDate || !serviceTime) {
          return null;
        }

        // Use utility function to calculate time difference
        const difference = calculateTimeDifference(serviceDate, serviceTime, 2);
        
        if (difference === null) {
          return null;
        }

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

        return result;
      } catch (error) {
        return null;
      }
    };

    const updateTimer = () => {
      const time = calculateTimeLeft();
      setTimeLeft(time);

      if (time && time.total <= 0 && !isExpired) {
        setIsExpired(true);
        onExpired?.();
        // Notify parent components that task has expired
        onTaskExpired?.(taskId || '');
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

  if (isExpired || timeLeft.total <= 0) {
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
