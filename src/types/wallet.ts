export interface Transaction {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface WalletTransaction {
  id: string;
  partner_id: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  reference_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WalletBalance {
  total: number;
  available: number;
  pending?: number;
}

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
}

export interface AddAmountFormData {
  amount: string;
}

export interface WithdrawFormData {
  amount: string;
  bankAccount: string;
}
