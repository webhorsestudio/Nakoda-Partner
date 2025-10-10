import React from 'react';
import { WalletStats as WalletStatsType } from '@/types/partnerWallet';
import { TopPartners } from './stats/TopPartners';

interface DetailedStatsProps {
  stats: WalletStatsType | null;
  loading?: boolean;
}

export function DetailedStats({ stats, loading = false }: DetailedStatsProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Top Partners */}
      <TopPartners topPartners={stats.topPartners} />
    </div>
  );
}
