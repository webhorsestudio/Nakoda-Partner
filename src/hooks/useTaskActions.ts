import { useCallback } from 'react';

interface UseTaskActionsReturn {
  handleViewDetails: (taskId: string) => void;
  handleCompleteTask: (taskId: string) => void;
}

export function useTaskActions(): UseTaskActionsReturn {
  const handleViewDetails = useCallback((taskId: string) => {
    console.log('Viewing ongoing task details:', taskId);
    // Navigate to ongoing order details page
    window.location.href = `/partner/ongoing-order/${taskId}`;
  }, []);

  const handleCompleteTask = useCallback((taskId: string) => {
    console.log('Completing task:', taskId);
    // This function is called when the Complete Task button is clicked
    // The actual completion logic is handled by the CountdownTimer component
    // which shows the TaskCompletionModal and handles the API call
    // This is just a placeholder - the real logic is in the modal
  }, []);

  return {
    handleViewDetails,
    handleCompleteTask
  };
}
