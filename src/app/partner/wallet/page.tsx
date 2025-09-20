'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { usePartnerWallet } from '@/hooks/usePartnerWallet';
import AddAmountModal from '@/components/partner/wallet/AddAmountModal';
import { WalletTransactions } from '@/components/partner/wallet/WalletTransactions';
import { WalletBalance } from '@/components/partner/wallet/WalletBalance';

export default function WalletPage() {
  const { isClient } = usePartnerAuth();
  const { balance, transactions, isLoading: walletLoading, error: walletError, fetchBalance, fetchTransactions } = usePartnerWallet();
  const [partnerInfo, setPartnerInfo] = useState<{name: string; email: string; phone: string} | null>(null);
  const [isAddAmountModalOpen, setIsAddAmountModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch partner info for payment
  const fetchPartnerInfo = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) return;

      const response = await fetch('/api/partners/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPartnerInfo({
            name: data.data.name || 'Partner',
            email: data.data.email || 'partner@example.com',
            phone: data.data.phone || '9999999999'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching partner info:', error);
    }
  };

  useEffect(() => {
    if (isClient) {
      // Check if user has auth token
      const token = localStorage.getItem('auth-token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      // Try to fetch wallet data and partner info
      Promise.all([fetchBalance(), fetchTransactions()]).catch((error) => {
        console.error('Wallet fetch error:', error);
        // If it's an auth error, redirect to login
        if (error.message.includes('authentication') || error.message.includes('token')) {
          router.push('/login');
        }
      });

      // Fetch partner info for payment
      fetchPartnerInfo();
    }
  }, [isClient, router, fetchBalance, fetchTransactions]);

  useEffect(() => {
    // Check if user returned from payment
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      setPaymentSuccess(true);
      Promise.all([fetchBalance(), fetchTransactions()]); // Refresh wallet data
      // Remove the query parameter from URL
      router.replace('/partner/wallet');
    }
  }, [searchParams, fetchBalance, fetchTransactions, router]);

  if (walletLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (walletError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Wallet</h3>
            <p className="text-sm text-red-600 mb-4">{walletError}</p>
            <button
              onClick={() => Promise.all([fetchBalance(), fetchTransactions()])}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Wallet</h1>
              <p className="text-sm text-gray-600">Manage your balance & transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Payment Success Message */}
        {paymentSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-green-800">Payment Successful!</h3>
                <p className="text-sm text-green-700 mt-1">Your wallet has been topped up successfully.</p>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Balance Card */}
        {balance && <WalletBalance balance={balance} />}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIsAddAmountModalOpen(true)}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Add Money</p>
                <p className="text-xs text-gray-500">Top up wallet</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              // TODO: Implement withdraw functionality
              alert('Withdraw functionality coming soon!');
            }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 opacity-75"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Withdraw</p>
                <p className="text-xs text-gray-500">Coming soon</p>
              </div>
            </div>
          </button>
        </div>

        {/* Wallet Transactions */}
        <WalletTransactions transactions={transactions} />

        {/* Add Amount Modal */}
        <AddAmountModal
          isOpen={isAddAmountModalOpen}
          onClose={() => setIsAddAmountModalOpen(false)}
          onAddAmount={() => {
            setIsAddAmountModalOpen(false);
            Promise.all([fetchBalance(), fetchTransactions()]);
          }}
          balance={balance || 0}
          partnerInfo={partnerInfo || undefined}
        />
      </div>
    </div>
  );
}