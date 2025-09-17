import React from 'react';
import { WalletStats } from '@/types/partnerWallet';

interface StatusBreakdownProps {
  statusBreakdown: WalletStats['statusBreakdown'];
}

export function StatusBreakdown({ statusBreakdown }: StatusBreakdownProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'suspended':
        return 'bg-yellow-500';
      case 'frozen':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Wallet Status Breakdown</h3>
      <div className="space-y-3">
        {Object.entries(statusBreakdown).map(([status, count]) => (
          <div key={status} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(status)}`} />
              <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
