import React from 'react';
import { WalletStats as WalletStatsType } from '@/types/partnerWallet';
import { StatusBreakdown } from './stats/StatusBreakdown';
import { BalanceDistribution } from './stats/BalanceDistribution';
import { RecentActivity } from './stats/RecentActivity';
import { TopPartners } from './stats/TopPartners';

interface DetailedStatsProps {
  stats: WalletStatsType | null;
  loading?: boolean;
}

export function DetailedStats({ stats, loading = false }: DetailedStatsProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
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
      {/* Status Breakdown and Balance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusBreakdown statusBreakdown={stats.statusBreakdown} />
        <BalanceDistribution balanceDistribution={stats.balanceDistribution} />
      </div>

      {/* Recent Activity */}
      <RecentActivity recentActivity={stats.recentActivity} />

      {/* Top Partners */}
      <TopPartners topPartners={stats.topPartners} />
    </div>
  );
}
