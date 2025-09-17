import React from 'react';
import { PartnerWallet } from '@/types/partnerWallet';
import { PlusIcon } from '@heroicons/react/24/outline';

interface PartnerRowProps {
  partner: PartnerWallet;
  onAddBalance: (partner: PartnerWallet) => void;
}

export function PartnerRow({ partner, onAddBalance }: PartnerRowProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'frozen':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{partner.name}</div>
          <div className="text-sm text-gray-500">
            {partner.mobile && `+91 ${partner.mobile}`}
            {partner.email && ` • ${partner.email}`}
          </div>
          {partner.code && (
            <div className="text-xs text-gray-400">Code: {partner.code}</div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{partner.service_type}</div>
        <div className="text-sm text-gray-500">{partner.city}</div>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationColor(partner.verification_status)}`}>
          {partner.verification_status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-gray-900">
          {formatCurrency(partner.wallet_balance)}
        </div>
        <div className="text-xs text-gray-500">
          Total Balance
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(partner.wallet_status)}`}>
          {partner.wallet_status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(partner.last_transaction_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => onAddBalance(partner)}
          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
        >
          <PlusIcon className="w-4 h-4" />
          Add Balance
        </button>
      </td>
    </tr>
  );
}
