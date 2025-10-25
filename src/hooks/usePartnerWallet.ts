import { useState, useCallback, useEffect, useRef } from 'react';
import { getAuthToken } from '@/utils/authUtils';

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

  // Use refs to prevent infinite loops
  const isInitialized = useRef(false);
  const isFetching = useRef(false);

  const fetchBalance = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isFetching.current) {
      console.log('🔄 fetchBalance already in progress, skipping');
      return;
    }

    try {
      isFetching.current = true;
      setIsLoading(true);
      setError(null);

      // Use the new token helper that handles both localStorage and cookies
      const token = getAuthToken();
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
            if (decoded.role === 'admin') {
              console.warn('⚠️ Admin user accessing partner wallet - skipping wallet functionality');
              return;
            }
            console.warn('⚠️ Non-partner user trying to access partner wallet API');
            throw new Error('This feature is only available for partners');
          }
        }
      } catch (tokenError) {
        console.error('Error parsing token:', tokenError);
        throw new Error('Invalid authentication token');
      }

      console.log('🔍 Fetching wallet balance with token length:', token.length);

      const response = await fetch('/api/partners/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Wallet balance response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Wallet balance API error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Wallet balance data received:', data);

      if (data.success) {
        setBalance(data.data.walletBalance);
        console.log('✅ Wallet balance set to:', data.data.walletBalance);
      } else {
        throw new Error(data.error || 'Failed to fetch balance');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(errorMessage);
      console.error('❌ Error fetching balance:', err);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      // Use the new token helper that handles both localStorage and cookies
      const token = getAuthToken();
      if (!token) {
        console.warn('⚠️ No authentication token found for transactions');
        return;
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

      console.log('🔍 Fetching wallet transactions with token length:', token.length);

      const response = await fetch('/api/partners/wallet/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Wallet transactions response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Wallet transactions API error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Wallet transactions data received:', data);

      if (data.success) {
        setTransactions(data.data.transactions || []);
        console.log('✅ Wallet transactions set, count:', data.data.transactions?.length || 0);
      } else {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('❌ Error fetching transactions:', err);
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

  // Initialize data only once
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      console.log('🔄 Initializing wallet data...');
      Promise.all([fetchBalance(), fetchTransactions()]).catch((error) => {
        console.error('❌ Initial wallet fetch error:', error);
      });
    }
  }, []); // Empty dependency array - runs only once

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