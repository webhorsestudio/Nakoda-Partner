import React from 'react';
import { WalletTransaction } from '@/hooks/usePartnerWallet';
import { formatCurrency, formatDate } from '@/utils/walletUtils';

interface WalletTransactionsProps {
  transactions: WalletTransaction[];
}

export function WalletTransactions({ transactions }: WalletTransactionsProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button className="text-blue-600 text-sm font-medium">View All</button>
        </div>
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No transactions yet</p>
          <p className="text-sm text-gray-400 mt-1">Your wallet transactions will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <button className="text-blue-600 text-sm font-medium">View All</button>
      </div>
      
      <div className="space-y-4">
        {transactions.slice(0, 5).map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.transaction_type === 'credit'
                    ? 'bg-green-100'
                    : transaction.transaction_type === 'debit'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}
              >
                {transaction.transaction_type === 'credit' ? (
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {transaction.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-gray-500">
                    {formatDate(transaction.processed_at)}
                  </p>
                  <span className="text-xs text-gray-400">•</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    transaction.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : transaction.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-bold ${
                  transaction.transaction_type === 'credit'
                    ? 'text-green-600'
                    : transaction.transaction_type === 'debit'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {transaction.transaction_type === 'credit' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
