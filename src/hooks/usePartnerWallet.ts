import { useState, useCallback, useEffect } from 'react';

export interface WalletBalance {
  partnerId: number;
  partnerName: string;
  walletBalance: number;
  availableBalance: number;
  pendingBalance: number;
  walletStatus: string;
  lastTransactionAt: string | null;
}

export interface WalletTransaction {
  id: number;
  transaction_type: 'credit' | 'debit' | 'refund' | 'commission' | 'adjustment';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  reference_id: string | null;
  reference_type: string | null;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata: Record<string, unknown>;
  processed_at: string;
  created_at: string;
}

export interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AddAmountRequest {
  amount: number;
  description?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

export interface WithdrawRequest {
  amount: number;
  bankAccountId: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export function usePartnerWallet() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth-token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
  }, []);

  const fetchBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/partners/wallet/balance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch wallet balance');
      }

      const data = await response.json();
      setBalance(data.data);
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wallet balance';
      setError(errorMessage);
      console.error('Error fetching wallet balance:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  const fetchTransactions = useCallback(async (page = 1, limit = 10, type?: string, status?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(type && { type }),
        ...(status && { status }),
      });

      const response = await fetch(`/api/partners/wallet/transactions?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.data.transactions);
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('Error fetching transactions:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  const addAmount = useCallback(async (request: AddAmountRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/partners/wallet/add-amount', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add amount to wallet');
      }

      const data = await response.json();
      
      // Update balance
      if (balance) {
        setBalance({
          ...balance,
          walletBalance: data.data.newBalance,
          availableBalance: data.data.availableBalance,
          lastTransactionAt: data.data.lastTransactionAt,
        });
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add amount to wallet';
      setError(errorMessage);
      console.error('Error adding amount to wallet:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, balance]);

  const withdraw = useCallback(async (request: WithdrawRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/partners/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process withdrawal');
      }

      const data = await response.json();
      
      // Update balance
      if (balance) {
        setBalance({
          ...balance,
          walletBalance: data.data.newBalance,
          availableBalance: data.data.availableBalance,
          lastTransactionAt: data.data.lastTransactionAt,
        });
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process withdrawal';
      setError(errorMessage);
      console.error('Error processing withdrawal:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, balance]);

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        fetchBalance(),
        fetchTransactions(1, 10)
      ]);
    } catch (err) {
      console.error('Error refreshing wallet data:', err);
    }
  }, [fetchBalance, fetchTransactions]);

  // Load balance on mount
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    transactions,
    isLoading,
    error,
    fetchBalance,
    fetchTransactions,
    addAmount,
    withdraw,
    refreshAll,
  };
}
