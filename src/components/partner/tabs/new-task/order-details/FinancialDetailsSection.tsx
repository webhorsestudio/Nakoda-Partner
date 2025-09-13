import React from 'react';
import { CreditCardIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialDetailsSectionProps } from './types';

export default function FinancialDetailsSection({ financial }: FinancialDetailsSectionProps) {
  return (
    <Card className="bg-white border border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
          <CreditCardIcon className="w-5 h-5 text-green-600" />
          Financial Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-700 mb-1">Total Amount</div>
            <div className="text-2xl font-bold text-green-800">₹{financial.totalAmount}</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-700 mb-1">Advance Amount</div>
            <div className="text-2xl font-bold text-blue-800">₹{financial.advanceAmount}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
