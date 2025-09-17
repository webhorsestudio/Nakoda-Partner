import React, { useState, useEffect } from 'react';
import { PartnerWallet } from '@/types/partnerWallet';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AddBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: PartnerWallet | null;
  onAddBalance: (request: {
    partnerId: number;
    amount: number;
    type: 'credit' | 'debit' | 'adjustment';
    description?: string;
  }) => Promise<boolean>;
  loading?: boolean;
}

export function AddBalanceModal({ 
  isOpen, 
  onClose, 
  partner, 
  onAddBalance, 
  loading = false 
}: AddBalanceModalProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'credit' | 'debit' | 'adjustment'>('credit');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && partner) {
      setAmount('');
      setType('credit');
      setDescription('');
    }
  }, [isOpen, partner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partner || !amount || parseFloat(amount) <= 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await onAddBalance({
        partnerId: partner.id,
        amount: parseFloat(amount),
        type,
        description: description.trim() || undefined
      });

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error adding balance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen || !partner) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Add Balance
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Partner Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{partner.name}</h4>
            <p className="text-sm text-gray-600">
              {partner.service_type} • {partner.city}
            </p>
            <p className="text-sm text-gray-600">
              Current Balance: <span className="font-semibold">{formatCurrency(partner.wallet_balance)}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as 'credit' | 'debit' | 'adjustment')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isSubmitting}
                required
              >
                <option value="credit">Credit (Add Money)</option>
                <option value="debit">Debit (Deduct Money)</option>
                <option value="adjustment">Adjustment (Set Balance)</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0.01"
                step="0.01"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description for this transaction"
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>

            {/* Preview */}
            {amount && parseFloat(amount) > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Preview:</strong> {type === 'credit' ? 'Add' : type === 'debit' ? 'Deduct' : 'Set'} ₹{parseFloat(amount).toFixed(2)} 
                  {type === 'credit' && ` (New balance: ${formatCurrency(partner.wallet_balance + parseFloat(amount))})`}
                  {type === 'debit' && ` (New balance: ${formatCurrency(Math.max(0, partner.wallet_balance - parseFloat(amount)))})`}
                  {type === 'adjustment' && ` (New balance: ${formatCurrency(parseFloat(amount))})`}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              >
                {isSubmitting ? 'Processing...' : 'Add Balance'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
