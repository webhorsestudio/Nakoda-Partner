import React from 'react';

export default function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="bg-gray-50 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">No Recent Orders Available</h3>
      <p className="text-gray-600 text-sm max-w-sm mx-auto">
        No new orders from the last 24 hours match your location and service preferences right now. 
        New orders will appear here automatically when they become available.
      </p>
      <div className="mt-4 text-xs text-gray-500">
        <p>• Only showing orders from last 24 hours</p>
        <p>• Orders are matched based on your city and service type</p>
        <p>• New orders appear in real-time</p>
        <p>• Old orders automatically disappear after 24 hours</p>
      </div>
    </div>
  );
}
