import { useState, useEffect, useCallback } from 'react';
import { WalletBalance, WalletTransaction } from '@/types/wallet';

interface UseWalletReturn {
  balance: WalletBalance;
  transactions: WalletTransaction[];
  loading: boolean;
  error: string | null;
  refreshWallet: () => Promise<void>;
}

export function useWallet(): UseWalletReturn {
  const [balance, setBalance] = useState<WalletBalance>({
    total: 0,
    available: 0,
    pending: 0,
  });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Ensure token is also set as cookie for API access
      document.cookie = `auth-token=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;

      // Fetch wallet balance
      const balanceResponse = await fetch('/api/partners/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!balanceResponse.ok) {
        throw new Error('Failed to fetch wallet balance');
      }
      const balanceData = await balanceResponse.json();
      if (balanceData.success) {
        setBalance({
          total: balanceData.data.walletBalance,
          available: balanceData.data.availableBalance,
          pending: balanceData.data.pendingBalance
        });
      } else {
        throw new Error(balanceData.error || 'Failed to fetch wallet balance');
      }

      // Fetch wallet transactions
      const transactionsResponse = await fetch('/api/partners/wallet/transactions?page=1&limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch wallet transactions');
      }
      const transactionsData = await transactionsResponse.json();
      if (transactionsData.success) {
        setTransactions(transactionsData.data || []);
      } else {
        // Don't throw error for transactions, just log it
        console.warn('Failed to fetch transactions:', transactionsData.error);
        setTransactions([]);
      }

    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    await fetchWalletData();
  }, [fetchWalletData]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  return {
    balance,
    transactions,
    loading,
    error,
    refreshWallet,
  };
}
