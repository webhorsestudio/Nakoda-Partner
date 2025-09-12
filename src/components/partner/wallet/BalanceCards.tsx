import React from 'react';
import { ArrowDownIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { WalletBalance } from '@/types/wallet';
import { formatCurrency } from '@/utils/walletUtils';

interface BalanceCardsProps {
  balance: WalletBalance;
}

export default function BalanceCards({ balance }: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Total Balance */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-blue-600">Total Balance</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-900 truncate">
              {formatCurrency(balance.total)}
            </p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
            <span className="text-white font-bold text-sm sm:text-lg">₹</span>
          </div>
        </div>
      </Card>

      {/* Available Balance */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-green-600">Available</p>
            <p className="text-xl sm:text-2xl font-bold text-green-900 truncate">
              {formatCurrency(balance.available)}
            </p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
            <ArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
        </div>
      </Card>
    </div>
  );
}
