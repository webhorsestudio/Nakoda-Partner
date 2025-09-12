import React from 'react';
import { PlusIcon, MinusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  onAddAmount: () => void;
  onWithdraw: () => void;
}

export default function ActionButtons({ onAddAmount, onWithdraw }: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={onAddAmount}
        className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 sm:h-10"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        <span className="text-sm sm:text-base">Add Amount</span>
      </Button>
      <Button
        variant="outline"
        onClick={onWithdraw}
        className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 h-12 sm:h-10"
      >
        <MinusIcon className="h-4 w-4 mr-2" />
        <span className="text-sm sm:text-base">Withdraw</span>
      </Button>
    </div>
  );
}
