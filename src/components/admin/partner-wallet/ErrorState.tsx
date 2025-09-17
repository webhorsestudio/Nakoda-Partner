import React from 'react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  title?: string;
}

export function ErrorState({ 
  error, 
  onRetry, 
  title = "Error Loading Partner Wallets" 
}: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">{title}</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={onRetry}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
