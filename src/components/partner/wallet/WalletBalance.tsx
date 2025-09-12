import React from 'react';
import { WalletBalance as WalletBalanceType } from '@/hooks/usePartnerWallet';
import { formatCurrency } from '@/utils/walletUtils';

interface WalletBalanceProps {
  balance: WalletBalanceType;
}

export function WalletBalance({ balance }: WalletBalanceProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Wallet Balance</h2>
        </div>
        <div className="bg-white bg-opacity-20 p-2 w-10 h-10 flex items-center justify-center rounded-lg">
          <span className="text-2xl font-bold">₹</span>
        </div>
      </div>

      {/* Main Balance */}
      <div className="mb-6">
        <div className="text-4xl font-bold">
          {formatCurrency(balance.walletBalance)}
        </div>
      </div>

      {/* Wallet Status */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-blue-100">Status:</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          balance.walletStatus === 'active' 
            ? 'bg-green-500 text-white' 
            : 'bg-yellow-500 text-white'
        }`}>
          {balance.walletStatus || 'Active'}
        </span>
      </div>
    </div>
  );
}
