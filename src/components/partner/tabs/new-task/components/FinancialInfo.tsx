import React from 'react';
import { formatCurrency } from '../utils/currencyUtils';

interface FinancialInfoProps {
  amount: number;
  advanceAmount: number;
}

export default function FinancialInfo({ amount, advanceAmount }: FinancialInfoProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Total Amount</p>
          <p className="text-xl font-semibold">{formatCurrency(amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Advance</p>
          <p className="text-lg font-medium text-blue-700">{formatCurrency(advanceAmount)}</p>
        </div>
      </div>
    </div>
  );
}
