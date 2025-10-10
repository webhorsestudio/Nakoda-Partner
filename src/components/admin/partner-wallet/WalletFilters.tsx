import React, { useCallback } from 'react';
import { PartnerWalletFilters } from '@/types/partnerWallet';
import { SimpleSearch } from './filters/SimpleSearch';

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
  const handleSearchChange = useCallback((value: string) => {
    onFiltersChange({ search: value, page: 1 }); // Reset to first page when searching
  }, [onFiltersChange]);

  return (
    <SimpleSearch
      value={filters.search || ''}
      onChange={handleSearchChange}
      disabled={loading}
    />
  );
}
