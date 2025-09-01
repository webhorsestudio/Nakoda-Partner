import React from 'react';

interface RevenueTabProps {
  coins?: number;
}

export default function RevenueTab({ coins = 0 }: RevenueTabProps) {
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <div className="bg-green-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Revenue & Earnings</h3>
        <p className="text-slate-500">This tab will show your earnings, revenue trends, and financial insights</p>
        
        {/* Display current coins */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 mb-2">Current Balance</p>
          <p className="text-2xl font-bold text-green-700">₹{coins.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
