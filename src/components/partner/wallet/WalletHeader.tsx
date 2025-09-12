import React from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletHeaderProps {
  onBack: () => void;
}

export default function WalletHeader({ onBack }: WalletHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 py-3">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-3 h-10 w-10 sm:h-9 sm:w-9"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Wallet</h1>
        </div>
      </div>
    </div>
  );
}
