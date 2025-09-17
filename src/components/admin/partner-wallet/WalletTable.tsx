import React, { useState } from 'react';
import { PartnerWallet, WalletPagination } from '@/types/partnerWallet';
import { AddBalanceModal } from './AddBalanceModal';
import { TableHeader } from './table/TableHeader';
import { EmptyState } from './table/EmptyState';
import { LoadingState } from './table/LoadingState';
import { PartnerRow } from './table/PartnerRow';
import { Pagination } from './table/Pagination';

interface WalletTableProps {
  partners: PartnerWallet[];
  pagination: WalletPagination | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onAddBalance: (request: {
    partnerId: number;
    amount: number;
    type: 'credit' | 'debit' | 'adjustment';
    description?: string;
  }) => Promise<boolean>;
}

export function WalletTable({ 
  partners, 
  pagination, 
  loading, 
  onPageChange,
  onAddBalance 
}: WalletTableProps) {
  const [selectedPartner, setSelectedPartner] = useState<PartnerWallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleAddBalance = (partner: PartnerWallet) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPartner(null);
  };

  const handleAddBalanceSubmit = async (request: {
    partnerId: number;
    amount: number;
    type: 'credit' | 'debit' | 'adjustment';
    description?: string;
  }) => {
    const success = await onAddBalance(request);
    if (success) {
      handleModalClose();
    }
    return success;
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <TableHeader totalItems={pagination?.totalItems || 0} />

        {partners.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Partner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service & Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wallet Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {partners.map((partner) => (
                    <PartnerRow
                      key={partner.id}
                      partner={partner}
                      onAddBalance={handleAddBalance}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && (
              <Pagination
                pagination={pagination}
                onPageChange={onPageChange}
              />
            )}
          </>
        )}
      </div>

      {/* Add Balance Modal */}
      <AddBalanceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        partner={selectedPartner}
        onAddBalance={handleAddBalanceSubmit}
        loading={loading}
      />
    </>
  );
}
