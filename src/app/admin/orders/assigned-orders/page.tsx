"use client";

import React, { useState } from 'react';
import { Pagination } from '@/components/ui/Pagination';
import { PartnerWithAssignedOrders, useAssignedOrders } from '@/hooks/useAssignedOrders';

// Import our new components
import PageHeader from '@/components/admin/assigned-orders/PageHeader';
import SearchAndFilters from '@/components/admin/assigned-orders/SearchAndFilters';
import PartnersGrid from '@/components/admin/assigned-orders/PartnersGrid';
import PartnerDetailsModal from '@/components/admin/assigned-orders/PartnerDetailsModal';
import ErrorState from '@/components/admin/assigned-orders/ErrorState';

export default function AssignedOrdersPage() {
  const {
    partners,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchTerm,
    dateFrom,
    dateTo,
    totalAssignedOrders,
    setSearchTerm,
    setDateFrom,
    setDateTo,
    setCurrentPage,
    refreshPartners
  } = useAssignedOrders();

  const [selectedPartner, setSelectedPartner] = useState<PartnerWithAssignedOrders | null>(null);
  const [showPartnerDetails, setShowPartnerDetails] = useState(false);

  const handleViewPartner = (partner: PartnerWithAssignedOrders) => {
    setSelectedPartner(partner);
    setShowPartnerDetails(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCloseModal = () => {
    setShowPartnerDetails(false);
    setSelectedPartner(null);
  };

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={refreshPartners} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        loading={loading}
        totalItems={totalItems}
        totalAssignedOrders={totalAssignedOrders}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onRefresh={refreshPartners}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onSearchChange={setSearchTerm}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />

        {/* Partners Grid */}
        <PartnersGrid
          partners={partners}
          loading={loading}
          searchTerm={searchTerm}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onViewPartner={handleViewPartner}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Partner Details Modal */}
      <PartnerDetailsModal
        isOpen={showPartnerDetails}
        partner={selectedPartner}
        onClose={handleCloseModal}
      />
    </div>
  );
}
