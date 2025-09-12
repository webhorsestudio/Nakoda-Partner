import React from 'react';
import { WalletIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface WalletProps {
  coins: number;
  walletBalance?: number;
  className?: string;
}

export default function Wallet({ coins, walletBalance, className = '' }: WalletProps) {
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

  // Use wallet balance if available, otherwise fall back to coins
  const displayAmount = walletBalance !== undefined ? walletBalance : coins;

  return (
    <div className={`${className}`}>
      <button
        className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer transition-colors"
        role="button"
        tabIndex={0}
        aria-label={`Wallet balance: ₹${displayAmount.toLocaleString()}. Click to view wallet details.`}
        onClick={handleWalletClick}
        onKeyDown={handleKeyDown}
      >
        <WalletIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
        <span className="font-semibold text-sm">₹{displayAmount.toLocaleString()}</span>
      </button>
    </div>
  );
}
