import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OngoingFinancialDetailsSectionProps } from './types';
import { formatCurrency } from '../utils/currencyUtils';
import PaymentMode from '../../new-task/components/PaymentMode';

export default function OngoingFinancialDetailsSection({ financial }: OngoingFinancialDetailsSectionProps) {
  const { totalAmount, advanceAmount, balanceAmount, mode } = financial;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Financial Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Amount</span>
            <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">Advance Paid</span>
            <span className="text-xl font-bold">{formatCurrency(advanceAmount)}</span>
          </div>
        </div>

        {/* Balance Amount - More prominent styling */}
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-blue-900">Balance Amount</span>
            <span className="text-2xl font-black text-blue-900">{formatCurrency(balanceAmount)}</span>
          </div>
          <div className="mt-1 text-sm text-blue-700">
            {(() => {
              const isCashOnDelivery = mode && (
                mode.toLowerCase().includes('cash on delivery') ||
                mode.toLowerCase().includes('cod') ||
                mode === 'Cash on Delivery' ||
                mode === 'cash on delivery' ||
                mode === 'COD' ||
                mode === 'cod'
              );
              return isCashOnDelivery 
                ? 'To be collected from customer' 
                : 'Remaining amount after advance';
            })()}
          </div>
        </div>

        {/* Payment Mode */}
        <PaymentMode mode={mode} />
      </CardContent>
    </Card>
  );
}

