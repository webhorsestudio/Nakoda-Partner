import { useState, useCallback, useEffect } from 'react';

interface WalletTransaction {
  id: number;
  transaction_type: 'credit' | 'debit' | 'refund' | 'commission' | 'adjustment';
  amount: number;
  description: string;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
}

interface UsePartnerWalletReturn {
  balance: number | null;
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;
  fetchBalance: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addAmount: (amount: number) => Promise<boolean>;
  withdrawAmount: (amount: number) => Promise<boolean>;
}

export function usePartnerWallet(): UsePartnerWalletReturn {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is authenticated and is a partner
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Check user role before making API call
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const base64Url = parts[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
          const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          
          if (decoded.role !== 'partner') {
            console.warn('⚠️ Non-partner user trying to access partner wallet API');
            throw new Error('This feature is only available for partners');
          }
        }
      } catch (tokenError) {
        console.error('Error parsing token:', tokenError);
        throw new Error('Invalid authentication token');
      }

      const response = await fetch('/api/partners/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setBalance(data.data.walletBalance);
      } else {
        throw new Error(data.error || 'Failed to fetch balance');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(errorMessage);
      console.error('Error fetching balance:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      // Check if user is authenticated and is a partner
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Check user role before making API call
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const base64Url = parts[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
          const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          
          if (decoded.role !== 'partner') {
            console.warn('⚠️ Non-partner user trying to access partner wallet transactions API');
            return; // Silently return for transactions to avoid blocking the UI
          }
        }
      } catch (tokenError) {
        console.error('Error parsing token:', tokenError);
        return; // Silently return for transactions to avoid blocking the UI
      }

      const response = await fetch('/api/partners/wallet/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data.transactions || []);
      } else {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      // Don't set error for transactions to avoid blocking the UI
    }
  }, []);

  const addAmount = useCallback(async (amount: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/partners/wallet/add-amount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.success) {
        // Refresh balance and transactions
        await Promise.all([fetchBalance(), fetchTransactions()]);
        return true;
      } else {
        throw new Error(data.error || 'Failed to add amount');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add amount';
      setError(errorMessage);
      console.error('Error adding amount:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBalance, fetchTransactions]);

  const withdrawAmount = useCallback(async (amount: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/partners/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.success) {
        // Refresh balance and transactions
        await Promise.all([fetchBalance(), fetchTransactions()]);
        return true;
      } else {
        throw new Error(data.error || 'Failed to withdraw amount');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw amount';
      setError(errorMessage);
      console.error('Error withdrawing amount:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBalance, fetchTransactions]);

  // Auto-fetch balance on mount
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
    withdrawAmount
  };
}