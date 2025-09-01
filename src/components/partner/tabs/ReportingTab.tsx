import React from 'react';

export default function ReportingTab() {
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <div className="bg-purple-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Reporting & Analytics</h3>
        <p className="text-slate-500">This tab will show detailed reports, performance metrics, and analytics</p>
      </div>
    </div>
  );
}
