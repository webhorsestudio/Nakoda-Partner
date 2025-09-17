import React from 'react';
import { PartnerWalletFilters } from '@/types/partnerWallet';
import { FilterHeader } from './filters/FilterHeader';
import { SearchFilter } from './filters/SearchFilter';
import { SelectFilter } from './filters/SelectFilter';
import { NumberFilter } from './filters/NumberFilter';

interface WalletFiltersProps {
  filters: PartnerWalletFilters;
  onFiltersChange: (filters: Partial<PartnerWalletFilters>) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

export function WalletFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  loading = false 
}: WalletFiltersProps) {
  const handleFilterChange = (key: keyof PartnerWalletFilters, value: string | number | undefined) => {
    onFiltersChange({ [key]: value, page: 1 }); // Reset to first page when filtering
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'page' && key !== 'limit' && value !== undefined && value !== ''
  );

  const walletStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'frozen', label: 'Frozen' },
    { value: 'closed', label: 'Closed' }
  ];

  const serviceTypeOptions = [
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Cleaning', label: 'Cleaning' },
    { value: 'Carpentry', label: 'Carpentry' },
    { value: 'Painting', label: 'Painting' },
    { value: 'Other', label: 'Other' }
  ];

  const verificationStatusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Verified', label: 'Verified' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  const limitOptions = [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' },
    { value: '100', label: '100' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <FilterHeader
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        loading={loading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <SearchFilter
          value={filters.search || ''}
          onChange={(value) => handleFilterChange('search', value)}
          disabled={loading}
        />

        <SelectFilter
          label="Wallet Status"
          id="wallet_status"
          value={filters.wallet_status || ''}
          onChange={(value) => handleFilterChange('wallet_status', value || undefined)}
          options={walletStatusOptions}
          disabled={loading}
          placeholder="All Status"
        />

        <SelectFilter
          label="Service Type"
          id="service_type"
          value={filters.service_type || ''}
          onChange={(value) => handleFilterChange('service_type', value || undefined)}
          options={serviceTypeOptions}
          disabled={loading}
          placeholder="All Services"
        />

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
            placeholder="Enter city..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <SelectFilter
          label="Verification Status"
          id="verification_status"
          value={filters.verification_status || ''}
          onChange={(value) => handleFilterChange('verification_status', value || undefined)}
          options={verificationStatusOptions}
          disabled={loading}
          placeholder="All Verification"
        />

        <NumberFilter
          label="Min Balance (₹)"
          id="min_balance"
          value={filters.min_balance || ''}
          onChange={(value) => handleFilterChange('min_balance', value || undefined)}
          disabled={loading}
          placeholder="0"
        />

        <NumberFilter
          label="Max Balance (₹)"
          id="max_balance"
          value={filters.max_balance || ''}
          onChange={(value) => handleFilterChange('max_balance', value || undefined)}
          disabled={loading}
          placeholder="No limit"
        />

        <SelectFilter
          label="Items Per Page"
          id="limit"
          value={filters.limit?.toString() || '20'}
          onChange={(value) => handleFilterChange('limit', parseInt(value))}
          options={limitOptions}
          disabled={loading}
        />
      </div>
    </div>
  );
}
