import React from 'react';
import { WalletStats } from '@/types/partnerWallet';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface BalanceDistributionProps {
  balanceDistribution: WalletStats['balanceDistribution'];
}

export function BalanceDistribution({ balanceDistribution }: BalanceDistributionProps) {
  const distributionItems = [
    {
      icon: ExclamationTriangleIcon,
      label: 'Zero Balance',
      count: balanceDistribution.zeroBalance,
      color: 'text-red-500'
    },
    {
      icon: CheckCircleIcon,
      label: 'High Balance (>₹10K)',
      count: balanceDistribution.highBalance,
      color: 'text-green-500'
    },
    {
      icon: ChartBarIcon,
      label: 'Normal Balance',
      count: balanceDistribution.normalBalance,
      color: 'text-blue-500'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Balance Distribution</h3>
      <div className="space-y-3">
        {distributionItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <item.icon className={`w-4 h-4 ${item.color} mr-3`} />
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
