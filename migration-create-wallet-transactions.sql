-- Migration: Create wallet_transactions table
-- Description: Creates a table to track all wallet transactions for partners

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id SERIAL NOT NULL,
  partner_id INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'credit', 'debit', 'refund', 'commission'
  amount NUMERIC(12, 2) NOT NULL,
  balance_before NUMERIC(12, 2) NOT NULL,
  balance_after NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  reference_id VARCHAR(100) NULL, -- Order ID, withdrawal ID, etc.
  reference_type VARCHAR(50) NULL, -- 'order', 'withdrawal', 'refund', 'commission'
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  metadata JSONB NULL, -- Additional transaction data
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_transactions_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE,
  CONSTRAINT wallet_transactions_type_check CHECK (
    transaction_type IN ('credit', 'debit', 'refund', 'commission', 'adjustment')
  ),
  CONSTRAINT wallet_transactions_status_check CHECK (
    status IN ('pending', 'completed', 'failed', 'cancelled')
  ),
  CONSTRAINT wallet_transactions_amount_check CHECK (amount > 0.00),
  CONSTRAINT wallet_transactions_balance_check CHECK (balance_after >= 0.00)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_partner_id ON public.wallet_transactions USING btree (partner_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions USING btree (transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON public.wallet_transactions USING btree (status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference ON public.wallet_transactions USING btree (reference_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_partner_created ON public.wallet_transactions USING btree (partner_id, created_at DESC);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_partner_type_status ON public.wallet_transactions USING btree (partner_id, transaction_type, status);

-- Add comments for documentation
COMMENT ON TABLE public.wallet_transactions IS 'Tracks all wallet transactions for partners';
COMMENT ON COLUMN public.wallet_transactions.partner_id IS 'Reference to the partner';
COMMENT ON COLUMN public.wallet_transactions.transaction_type IS 'Type of transaction (credit, debit, refund, commission, adjustment)';
COMMENT ON COLUMN public.wallet_transactions.amount IS 'Transaction amount (always positive)';
COMMENT ON COLUMN public.wallet_transactions.balance_before IS 'Wallet balance before transaction';
COMMENT ON COLUMN public.wallet_transactions.balance_after IS 'Wallet balance after transaction';
COMMENT ON COLUMN public.wallet_transactions.description IS 'Human-readable description of the transaction';
COMMENT ON COLUMN public.wallet_transactions.reference_id IS 'ID of related entity (order, withdrawal, etc.)';
COMMENT ON COLUMN public.wallet_transactions.reference_type IS 'Type of related entity';
COMMENT ON COLUMN public.wallet_transactions.status IS 'Transaction status (pending, completed, failed, cancelled)';
COMMENT ON COLUMN public.wallet_transactions.metadata IS 'Additional transaction data in JSON format';
COMMENT ON COLUMN public.wallet_transactions.processed_at IS 'When the transaction was processed';

-- Create trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_wallet_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_wallet_transactions_updated_at
  BEFORE UPDATE ON public.wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_transactions_updated_at();

-- Create function to add wallet transaction
CREATE OR REPLACE FUNCTION add_wallet_transaction(
  p_partner_id INTEGER,
  p_transaction_type VARCHAR(20),
  p_amount NUMERIC(12, 2),
  p_description TEXT,
  p_reference_id VARCHAR(100) DEFAULT NULL,
  p_reference_type VARCHAR(50) DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_balance_before NUMERIC(12, 2);
  v_balance_after NUMERIC(12, 2);
  v_transaction_id INTEGER;
BEGIN
  -- Get current wallet balance
  SELECT wallet_balance INTO v_balance_before
  FROM public.partners
  WHERE id = p_partner_id;
  
  -- Calculate new balance
  IF p_transaction_type = 'credit' OR p_transaction_type = 'refund' OR p_transaction_type = 'commission' THEN
    v_balance_after := v_balance_before + p_amount;
  ELSIF p_transaction_type = 'debit' THEN
    v_balance_after := v_balance_before - p_amount;
  ELSE
    RAISE EXCEPTION 'Invalid transaction type: %', p_transaction_type;
  END IF;
  
  -- Check if sufficient balance for debit
  IF p_transaction_type = 'debit' AND v_balance_after < 0 THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;
  
  -- Insert transaction record
  INSERT INTO public.wallet_transactions (
    partner_id, transaction_type, amount, balance_before, balance_after,
    description, reference_id, reference_type, metadata
  ) VALUES (
    p_partner_id, p_transaction_type, p_amount, v_balance_before, v_balance_after,
    p_description, p_reference_id, p_reference_type, p_metadata
  ) RETURNING id INTO v_transaction_id;
  
  -- Update partner wallet balance
  UPDATE public.partners
  SET 
    wallet_balance = v_balance_after,
    last_transaction_at = NOW(),
    wallet_updated_at = NOW()
  WHERE id = p_partner_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Add comment for the function
COMMENT ON FUNCTION add_wallet_transaction IS 'Adds a wallet transaction and updates partner balance';

-- Create view for transaction history
CREATE OR REPLACE VIEW public.partner_transaction_history AS
SELECT 
  wt.id,
  wt.partner_id,
  p.name AS partner_name,
  p.code AS partner_code,
  wt.transaction_type,
  wt.amount,
  wt.balance_before,
  wt.balance_after,
  wt.description,
  wt.reference_id,
  wt.reference_type,
  wt.status,
  wt.metadata,
  wt.processed_at,
  wt.created_at
FROM public.wallet_transactions wt
JOIN public.partners p ON wt.partner_id = p.id
WHERE p.deleted_at IS NULL
ORDER BY wt.created_at DESC;

-- Add comment for the view
COMMENT ON VIEW public.partner_transaction_history IS 'Transaction history with partner details';

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON public.wallet_transactions TO your_app_user;
-- GRANT SELECT ON public.partner_transaction_history TO your_app_user;
-- GRANT EXECUTE ON FUNCTION add_wallet_transaction TO your_app_user;
