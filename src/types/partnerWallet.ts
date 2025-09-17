export interface PartnerWallet {
  id: number;
  name: string;
  code?: string;
  mobile?: string;
  email?: string;
  city?: string;
  service_type: string;
  status: string;
  verification_status: string;
  wallet_balance: number;
  wallet_status: string;
  last_transaction_at?: string;
  wallet_created_at?: string;
  wallet_updated_at?: string;
  total_orders: number;
  total_revenue: number;
  rating: number;
  joined_date?: string;
  last_active?: string;
}

export interface PartnerWalletFilters {
  search?: string;
  wallet_status?: string;
  service_type?: string;
  city?: string;
  verification_status?: string;
  min_balance?: number;
  max_balance?: number;
  page?: number;
  limit?: number;
}

export interface WalletStats {
  overview: {
    totalPartners: number;
    totalWalletBalance: number;
    averageBalance: number;
  };
  statusBreakdown: {
    active: number;
    suspended: number;
    frozen: number;
    closed: number;
  };
  balanceDistribution: {
    zeroBalance: number;
    highBalance: number;
    normalBalance: number;
  };
  recentActivity: {
    totalTransactions: number;
    totalTransactionAmount: number;
    period: string;
  };
  topPartners: Array<{
    id: number;
    name: string;
    wallet_balance: number;
    service_type: string;
    city?: string;
  }>;
}

export interface WalletTransaction {
  id?: number;
  partner_id: number;
  transaction_type: 'credit' | 'debit' | 'adjustment';
  amount: number;
  balance_before: number;
  balance_after: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  created_by?: string;
  created_at: string;
}

export interface AddBalanceRequest {
  partnerId: number;
  amount: number;
  type: 'credit' | 'debit' | 'adjustment';
  description?: string;
}

export interface WalletPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
