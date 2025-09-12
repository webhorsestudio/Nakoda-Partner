import React from 'react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Transaction } from '@/types/wallet';
import { getTransactionColor, getStatusConfig, formatCurrency } from '@/utils/walletUtils';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onViewAll?: () => void;
}

export default function TransactionHistory({ transactions, onViewAll }: TransactionHistoryProps) {
  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? (
      <ArrowDownIcon className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowUpIcon className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getStatusConfig(status)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Transaction History</h2>
        {onViewAll && (
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={onViewAll}>
            View All
          </Button>
        )}
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 flex-shrink-0">
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                  {transaction.description}
                </p>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500">
                  <span>{transaction.date}</span>
                  <span>•</span>
                  <span>{transaction.time}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 flex-shrink-0">
              <span className={`font-semibold text-sm sm:text-base ${getTransactionColor(transaction.type)}`}>
                {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </span>
              {getStatusBadge(transaction.status)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
