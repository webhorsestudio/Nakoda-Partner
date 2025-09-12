import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Wallet } from 'lucide-react';

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMoney: () => void;
  requiredAmount: number;
  currentBalance: number;
}

export default function InsufficientBalanceModal({
  isOpen,
  onClose,
  onAddMoney,
  requiredAmount,
  currentBalance
}: InsufficientBalanceModalProps) {
  const shortfall = requiredAmount - currentBalance;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Insufficient Wallet Balance
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-full p-3 w-16 h-16 mx-auto mb-4">
              <Wallet className="w-10 h-10 text-red-500" />
            </div>
            
            <p className="text-gray-700 mb-4">
              You have insufficient wallet balance to accept this job.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Required Amount:</span>
              <span className="font-semibold text-red-600">₹{requiredAmount.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Balance:</span>
              <span className="font-semibold text-gray-700">₹{currentBalance.toLocaleString()}</span>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Shortfall:</span>
                <span className="font-bold text-red-600">₹{shortfall.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center">
            Please add money to your wallet to accept this job.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onAddMoney}
            className="flex-1 bg-blue-700 hover:bg-blue-800 text-white"
          >
            Add Money
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
