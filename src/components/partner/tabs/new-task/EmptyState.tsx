import React from 'react';

export default function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="bg-slate-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
        <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">No Tasks Available</h3>
      <p className="text-slate-500">Check back later for new opportunities or adjust your service preferences.</p>
    </div>
  );
}
