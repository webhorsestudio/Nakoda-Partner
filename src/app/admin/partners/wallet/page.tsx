'use client';

import React, { useEffect } from 'react';
import { useAdminPartnerWallet } from '@/hooks/useAdminPartnerWallet';
import { WalletHeader } from '@/components/admin/partner-wallet/WalletHeader';
import { ErrorState } from '@/components/admin/partner-wallet/ErrorState';
import { WalletStats } from '@/components/admin/partner-wallet/WalletStats';
import { DetailedStats } from '@/components/admin/partner-wallet/DetailedStats';
import { WalletFilters } from '@/components/admin/partner-wallet/WalletFilters';
import { WalletTable } from '@/components/admin/partner-wallet/WalletTable';
import { toast } from 'react-hot-toast';

export default function PartnerWalletPage() {
  const {
    partners,
    stats,
    loading,
    error,
    pagination,
    filters,
    fetchPartners,
    fetchStats,
    addBalance,
    setFilters,
    clearFilters
  } = useAdminPartnerWallet();

  // Fetch data on component mount
  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
    fetchPartners(newFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
    fetchPartners({});
  };

  const handlePageChange = (page: number) => {
    setFilters({ page });
    fetchPartners({ page });
  };

  const handleAddBalance = async (request: {
    partnerId: number;
    amount: number;
    type: 'credit' | 'debit' | 'adjustment';
    description?: string;
  }) => {
    const success = await addBalance(request);
    
    if (success) {
      toast.success('Balance updated successfully!');
    } else {
      toast.error('Failed to update balance. Please try again.');
    }
    
    return success;
  };

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchPartners()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WalletHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="mb-8">
          <WalletStats stats={stats} loading={loading} />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <WalletFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            loading={loading}
          />
        </div>

        {/* Detailed Stats */}
        <div className="mb-8">
          <DetailedStats stats={stats} loading={loading} />
        </div>

        {/* Table */}
        <WalletTable
          partners={partners}
          pagination={pagination}
          loading={loading}
          onPageChange={handlePageChange}
          onAddBalance={handleAddBalance}
        />
      </div>
    </div>
  );
}
