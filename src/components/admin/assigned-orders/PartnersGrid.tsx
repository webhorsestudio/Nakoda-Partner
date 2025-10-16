import React from 'react';
import { OrderCardSkeleton } from '@/components/ui/OrderCardSkeleton';
import { PartnerWithAssignedOrders } from '@/hooks/useAssignedOrders';
import PartnerCard from './PartnerCard';
import EmptyState from './EmptyState';

interface PartnersGridProps {
  partners: PartnerWithAssignedOrders[];
  loading: boolean;
  searchTerm: string;
  dateFrom: string;
  dateTo: string;
  onViewPartner: (partner: PartnerWithAssignedOrders) => void;
}

export default function PartnersGrid({
  partners,
  loading,
  searchTerm,
  dateFrom,
  dateTo,
  onViewPartner
}: PartnersGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <OrderCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <EmptyState 
        searchTerm={searchTerm}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {partners.map((partner) => (
        <PartnerCard
          key={partner.id}
          partner={partner}
          onViewPartner={onViewPartner}
        />
      ))}
    </div>
  );
}
