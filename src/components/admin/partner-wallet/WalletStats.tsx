import React from 'react';
import { WalletStats as WalletStatsType } from '@/types/partnerWallet';
import { 
  CurrencyDollarIcon, 
  UsersIcon, 
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { StatsCard } from './stats/StatsCard';

interface WalletStatsProps {
  stats: WalletStatsType | null;
  loading?: boolean;
}

export function WalletStats({ stats, loading = false }: WalletStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

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

  const statsCards = [
    {
      title: 'Total Partners',
      value: formatNumber(stats.overview.totalPartners),
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Wallet Balance',
      value: formatCurrency(stats.overview.totalWalletBalance),
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Average Balance',
      value: formatCurrency(stats.overview.averageBalance),
      icon: ChartBarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            bgColor={card.bgColor}
          />
        ))}
      </div>
    </div>
  );
}
