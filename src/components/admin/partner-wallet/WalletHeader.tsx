import React from 'react';

interface WalletHeaderProps {
  title?: string;
  subtitle?: string;
}

export function WalletHeader({ 
  title = "Partner Wallets",
  subtitle = "Manage partner wallet balances and transactions"
}: WalletHeaderProps) {
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
