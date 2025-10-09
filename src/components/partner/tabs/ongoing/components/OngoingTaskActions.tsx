import React, { useState } from 'react';
import { CheckCircleIcon, ArrowRightIcon, PhoneIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUTTON_STYLES, ACTION_LABELS } from '../constants/cardConstants';
import { 
  canCompleteTask, 
  isTaskCompleted, 
  isTaskCancelled, 
  getDetailsButtonClass,
  isValidPhoneNumber 
} from '../utils/cardUtils';
import TaskCompletionModal from './TaskCompletionModal';
import { toast } from 'react-hot-toast';
import { ACEFONE_CONFIG } from '@/config/acefone';

interface OngoingTaskActionsProps {
  taskId: string;
  status: 'in-progress' | 'completed' | 'cancelled' | 'assigned';
  onViewDetails: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  customerPhone?: string;
  isCompleted?: boolean;
  isExpired?: boolean;
}

export default function OngoingTaskActions({ 
  taskId, 
  status, 
  onViewDetails, 
  onCompleteTask,
  customerPhone,
  isCompleted = false,
  isExpired = false
}: OngoingTaskActionsProps) {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const canComplete = canCompleteTask(status);
  const isTaskCompletedStatus = isTaskCompleted(status);
  const isCancelled = isTaskCancelled(status);
  const hasValidPhone = isValidPhoneNumber(customerPhone || '');
  
  // Disable buttons if task is completed via timer OR database status OR expired
  const isDisabled = isCompleted || isTaskCompletedStatus || isExpired;
  
  const handleCallNow = () => {
    if (isDisabled || !customerPhone) {
      return;
    }
    
    // Show loading toast while initiating call
    const loadingToast = toast.loading('Initiating masked call...', {
      duration: 2000,
      icon: '📞',
    });
    
    // Log the call initiation attempt
    console.log('📞 Masked Call Now initiated:', {
      taskId,
      customerPhone,
      didNumber: ACEFONE_CONFIG.DID_NUMBER,
      timestamp: new Date().toISOString()
    });
    
    // Initiate the call using DID number for masking
    try {
      // Use DID number for call masking
      const didNumber = ACEFONE_CONFIG.DID_NUMBER;
      
      console.log('📞 Using DID number for call masking:', didNumber);
      
      const telLink = `tel:${didNumber}`;
      
      // Try different approaches based on device/browser
      if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
        // Mobile device - use tel: link
        window.location.href = telLink;
      } else {
        // Desktop - try creating a link element
        const link = document.createElement('a');
        link.href = telLink;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Dismiss loading toast and show success
      setTimeout(() => {
        toast.dismiss(loadingToast);
        toast.success(`Calling via masked number: ${didNumber}`, {
          duration: 3000,
          icon: '📞',
        });
      }, 1000);
      
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error('Failed to initiate masked call. Please try again.', {
        duration: 4000,
        icon: '❌',
      });
      
      console.error('❌ Error initiating masked call:', error);
    }
  };

  const handleCompleteTaskClick = () => {
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
      onCompleteTask(taskId);
      
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

  return (
    <div className="space-y-2 w-full">
      {/* Primary Action Button based on status */}
      {!isCompleted && !isCancelled && (
        <>
          {/* Complete Task Button - for in-progress tasks */}
          {canComplete && (
            <Button
              onClick={handleCompleteTaskClick}
              className={BUTTON_STYLES.success}
              size="sm"
            >
              <CheckCircleIcon className="w-4 h-4" />
              {ACTION_LABELS.COMPLETE_TASK}
            </Button>
          )}
        </>
      )}

      {/* Secondary Action Buttons */}
      <div className="flex gap-2 w-full">
        {/* Call Now Button */}
        {hasValidPhone && (
          <Button 
            onClick={handleCallNow}
            size="sm"
            className={BUTTON_STYLES.call}
            style={{ 
              backgroundColor: isDisabled ? '#9CA3AF' : '#FF8000',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.5 : 1
            }}
            disabled={isDisabled}
            title={isDisabled ? (isExpired ? 'Task has expired' : 'Task is completed') : 'Call customer via masked number'}
            onMouseEnter={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = '#E67300';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = '#FF8000';
              }
            }}
          >
            <PhoneIcon className="w-4 h-4" />
            {ACTION_LABELS.CALL_NOW}
          </Button>
        )}

        {/* View Details Button */}
        <Button 
          onClick={() => {
            if (isDisabled) {
              return;
            }
            onViewDetails(taskId);
          }}
          variant="outline"
          size="sm"
          className={`${BUTTON_STYLES.details} ${getDetailsButtonClass(hasValidPhone)}`}
          disabled={isDisabled}
          title={isDisabled ? (isExpired ? 'Task has expired' : 'Task is completed') : 'View task details'}
          style={{
            opacity: isDisabled ? 0.5 : 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            backgroundColor: isDisabled ? '#F3F4F6' : undefined,
            borderColor: isDisabled ? '#D1D5DB' : undefined,
            color: isDisabled ? '#9CA3AF' : undefined
          }}
        >
          <span>{ACTION_LABELS.VIEW_DETAILS}</span>
          <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Button>
      </div>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        isOpen={showCompletionModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        taskId={taskId}
        isLoading={isSubmitting}
      />
    </div>
  );
}
