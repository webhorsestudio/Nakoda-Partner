import React, { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletBalance, BankAccount } from '@/types/wallet';
import { formatCurrency, validateWithdrawAmount } from '@/utils/walletUtils';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: string, bankAccount: string) => void;
  balance: WalletBalance;
  bankAccounts: BankAccount[];
}

export default function WithdrawModal({ 
  isOpen, 
  onClose, 
  onWithdraw, 
  balance,
  bankAccounts 
}: WithdrawModalProps) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');

  const handleSubmit = () => {
    if (validateWithdrawAmount(withdrawAmount, balance.available) && selectedBankAccount) {
      onWithdraw(withdrawAmount, selectedBankAccount);
      setWithdrawAmount('');
      setSelectedBankAccount('');
      onClose();
    }
  };

  const handleClose = () => {
    setWithdrawAmount('');
    setSelectedBankAccount('');
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Withdraw Amount</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 text-gray-400 hover:text-gray-600"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Available Balance Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">Available Balance</span>
              <span className="text-lg font-bold text-green-900">
                {formatCurrency(balance.available)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Amount (₹)
            </label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount to withdraw"
              max={balance.available}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum: {formatCurrency(balance.available)}
            </p>
          </div>

          {/* Bank Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Account
            </label>
            <select 
              value={selectedBankAccount}
              onChange={(e) => setSelectedBankAccount(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
            >
              <option value="">Select bank account</option>
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountNumber} - {account.bankName}
                </option>
              ))}
            </select>
          </div>

          {/* Withdrawal Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Withdrawals may take 1-3 business days to process. A processing fee of ₹10 may apply.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-200">
          <Button
            onClick={handleSubmit}
            disabled={!validateWithdrawAmount(withdrawAmount, balance.available) || !selectedBankAccount}
            className="flex-1 bg-orange-600 hover:bg-orange-700 h-10"
          >
            <span className="text-sm">Withdraw</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-10"
          >
            <span className="text-sm">Cancel</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
