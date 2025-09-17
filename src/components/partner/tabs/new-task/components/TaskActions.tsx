import React, { useState } from 'react';
import { ZapIcon, ArrowRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePartnerWallet } from '@/hooks/usePartnerWallet';
import { useRouter } from 'next/navigation';
import InsufficientBalanceModal from './InsufficientBalanceModal';

interface TaskActionsProps {
  taskId: string;
  isAccepting: boolean;
  onAcceptTask: (taskId: string) => void;
  onViewDetails: (taskId: string) => void;
  advanceAmount: number;
}

export default function TaskActions({ 
  taskId, 
  isAccepting, 
  onAcceptTask, 
  onViewDetails,
  advanceAmount
}: TaskActionsProps) {
  const { balance, fetchBalance, isLoading: walletLoading } = usePartnerWallet();
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const router = useRouter();

  const handleAcceptTask = async () => {
    // If wallet is still loading, don't proceed
    if (walletLoading) {
      return;
    }

    // If no balance data, try to fetch it first
    if (!balance) {
      try {
        await fetchBalance();
        return; // Will retry after balance is loaded
      } catch (error) {
        console.error('Error fetching balance:', error);
        return;
      }
    }

    const currentBalance = balance || 0;
    
    if (currentBalance < advanceAmount) {
      setShowInsufficientBalanceModal(true);
      return;
    }

    // Proceed with task acceptance
    onAcceptTask(taskId);
  };

  const handleAddMoney = () => {
    setShowInsufficientBalanceModal(false);
    router.push('/partner/wallet');
  };

  return (
    <>
      <div className="flex gap-2 w-full">
        <Button 
          onClick={handleAcceptTask}
          disabled={isAccepting || walletLoading}
          className="flex-1 bg-blue-700 hover:bg-blue-800 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          size="sm"
        >
          {isAccepting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Accepting...
            </>
          ) : walletLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading...
            </>
          ) : (
            <>
              <ZapIcon className="w-4 h-4 mr-2" />
              Accept Task
            </>
          )}
        </Button>
        <Button 
          onClick={() => onViewDetails(taskId)}
          disabled={isAccepting}
          variant="outline"
          size="sm"
          className="group"
        >
          <span className="mr-2">Details</span>
          <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <InsufficientBalanceModal
        isOpen={showInsufficientBalanceModal}
        onClose={() => setShowInsufficientBalanceModal(false)}
        onAddMoney={handleAddMoney}
        requiredAmount={advanceAmount}
        currentBalance={balance || 0}
      />
    </>
  );
}
