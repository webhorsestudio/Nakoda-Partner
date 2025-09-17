import React from 'react';
import { WalletStats } from '@/types/partnerWallet';

interface RecentActivityProps {
  recentActivity: WalletStats['recentActivity'];
}

export function RecentActivity({ recentActivity }: RecentActivityProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Recent Activity ({recentActivity.period})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Total Transactions</p>
          <p className="text-2xl font-semibold text-gray-900">
            {formatNumber(recentActivity.totalTransactions)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Transaction Amount</p>
          <p className="text-2xl font-semibold text-gray-900">
            {formatCurrency(recentActivity.totalTransactionAmount)}
          </p>
        </div>
      </div>
    </div>
  );
}
