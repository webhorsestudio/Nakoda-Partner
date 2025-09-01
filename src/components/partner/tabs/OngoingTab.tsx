import React from 'react';

export default function OngoingTab() {
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <div className="bg-orange-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Ongoing Tasks</h3>
        <p className="text-slate-500">This tab will show your currently active tasks</p>
      </div>
    </div>
  );
}
