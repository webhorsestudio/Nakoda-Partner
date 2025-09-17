import React from 'react';
import { WalletStats } from '@/types/partnerWallet';

interface TopPartnersProps {
  topPartners: WalletStats['topPartners'];
}

export function TopPartners({ topPartners }: TopPartnersProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (topPartners.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Top Partners by Wallet Balance</h3>
      <div className="space-y-3">
        {topPartners.map((partner, index) => (
          <div key={partner.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{partner.name}</p>
                <p className="text-xs text-gray-500">{partner.service_type} • {partner.city}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(partner.wallet_balance)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
