import React from 'react';
import { formatCurrency } from '../utils/currencyUtils';
import PaymentMode from '../../new-task/components/PaymentMode';

interface OngoingFinancialInfoProps {
  amount: number;
  advanceAmount: number;
  balanceAmount: number;
  commissionAmount: number;
  status: 'in-progress' | 'completed' | 'cancelled' | 'assigned';
  mode?: string | null;
}

export default function OngoingFinancialInfo({ 
  amount, 
  advanceAmount, 
  balanceAmount, 
  commissionAmount,
  status,
  mode
}: OngoingFinancialInfoProps) {
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
      
      {/* Payment Mode */}
      <PaymentMode mode={mode} />
    </div>
  );
}
