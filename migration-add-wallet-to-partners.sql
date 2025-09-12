-- Migration: Add wallet functionality to partners table
-- Description: Adds wallet balance, available balance, and related fields to support partner wallet system

-- Add wallet-related columns to partners table
ALTER TABLE public.partners 
ADD COLUMN wallet_balance NUMERIC(12, 2) DEFAULT 0.00,
ADD COLUMN available_balance NUMERIC(12, 2) DEFAULT 0.00,
ADD COLUMN pending_balance NUMERIC(12, 2) DEFAULT 0.00,
ADD COLUMN wallet_status VARCHAR(20) DEFAULT 'active',
ADD COLUMN last_transaction_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN wallet_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN wallet_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add constraints for wallet fields
ALTER TABLE public.partners 
ADD CONSTRAINT partners_wallet_balance_check CHECK (wallet_balance >= 0.00),
ADD CONSTRAINT partners_available_balance_check CHECK (available_balance >= 0.00),
ADD CONSTRAINT partners_pending_balance_check CHECK (pending_balance >= 0.00),
ADD CONSTRAINT partners_wallet_status_check CHECK (
  wallet_status IN ('active', 'suspended', 'frozen', 'closed')
);

-- Add indexes for wallet-related queries
CREATE INDEX IF NOT EXISTS idx_partners_wallet_balance ON public.partners USING btree (wallet_balance);
CREATE INDEX IF NOT EXISTS idx_partners_available_balance ON public.partners USING btree (available_balance);
CREATE INDEX IF NOT EXISTS idx_partners_wallet_status ON public.partners USING btree (wallet_status);
CREATE INDEX IF NOT EXISTS idx_partners_last_transaction_at ON public.partners USING btree (last_transaction_at);

-- Add comments for documentation
COMMENT ON COLUMN public.partners.wallet_balance IS 'Total wallet balance including pending amounts';
COMMENT ON COLUMN public.partners.available_balance IS 'Amount available for withdrawal (excludes pending)';
COMMENT ON COLUMN public.partners.pending_balance IS 'Amount pending from completed orders';
COMMENT ON COLUMN public.partners.wallet_status IS 'Status of partner wallet (active, suspended, frozen, closed)';
COMMENT ON COLUMN public.partners.last_transaction_at IS 'Timestamp of last wallet transaction';
COMMENT ON COLUMN public.partners.wallet_created_at IS 'When wallet was first created';
COMMENT ON COLUMN public.partners.wallet_updated_at IS 'When wallet was last updated';

-- Create trigger function to update wallet_updated_at
CREATE OR REPLACE FUNCTION update_partner_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.wallet_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for wallet_updated_at
CREATE TRIGGER trigger_update_partner_wallet_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  WHEN (OLD.wallet_balance IS DISTINCT FROM NEW.wallet_balance 
        OR OLD.available_balance IS DISTINCT FROM NEW.available_balance 
        OR OLD.pending_balance IS DISTINCT FROM NEW.pending_balance)
  EXECUTE FUNCTION update_partner_wallet_updated_at();

-- Update existing partners with default wallet values
UPDATE public.partners 
SET 
  wallet_balance = 0.00,
  available_balance = 0.00,
  pending_balance = 0.00,
  wallet_status = 'active',
  wallet_created_at = COALESCE(created_at, NOW()),
  wallet_updated_at = NOW()
WHERE wallet_balance IS NULL;

-- Create a view for wallet summary
CREATE OR REPLACE VIEW public.partner_wallet_summary AS
SELECT 
  p.id,
  p.name,
  p.code,
  p.wallet_balance,
  p.available_balance,
  p.pending_balance,
  p.wallet_status,
  p.last_transaction_at,
  p.wallet_created_at,
  p.wallet_updated_at,
  (p.wallet_balance - p.available_balance) AS locked_balance
FROM public.partners p
WHERE p.deleted_at IS NULL;

-- Add comment for the view
COMMENT ON VIEW public.partner_wallet_summary IS 'Summary view of partner wallet information';

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT ON public.partner_wallet_summary TO your_app_user;
-- GRANT UPDATE ON public.partners TO your_app_user FOR COLUMNS (wallet_balance, available_balance, pending_balance, wallet_status, last_transaction_at);
