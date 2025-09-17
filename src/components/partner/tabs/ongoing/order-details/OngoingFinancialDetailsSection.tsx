import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OngoingFinancialDetailsSectionProps } from './types';
import { formatCurrency } from '../utils/currencyUtils';

export default function OngoingFinancialDetailsSection({ financial }: OngoingFinancialDetailsSectionProps) {
  const { totalAmount, advanceAmount } = financial;

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
      </CardContent>
    </Card>
  );
}

