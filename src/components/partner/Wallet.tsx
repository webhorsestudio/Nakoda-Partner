import React from 'react';
import { WalletIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface WalletProps {
  coins: number;
  className?: string;
}

export default function Wallet({ coins, className = '' }: WalletProps) {
  const router = useRouter();

  const handleWalletClick = () => {
    router.push('/partner/wallet');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleWalletClick();
    }
  };

  return (
    <div className={`${className}`}>
      <Badge 
        variant="secondary" 
        className="px-3 py-2 bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 cursor-pointer transition-colors"
        role="button"
        tabIndex={0}
        aria-label={`Wallet balance: ₹${coins.toLocaleString()}. Click to view wallet details.`}
        onClick={handleWalletClick}
        onKeyDown={handleKeyDown}
      >
        <WalletIcon className="h-4 w-4 mr-2" aria-hidden="true" />
        <span className="font-medium">₹{coins.toLocaleString()}</span>
      </Badge>
    </div>
  );
}
