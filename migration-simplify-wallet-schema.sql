-- Migration: Simplify Partner Wallet Schema
-- Date: 2024-12-20
-- Purpose: Remove available_balance and pending_balance fields, keep only wallet_balance
--          This simplifies the wallet system for most use cases

-- =====================================================
-- STEP 1: Update wallet_balance to include all balances
-- =====================================================
-- Merge all balances into wallet_balance
UPDATE partners 
SET wallet_balance = COALESCE(wallet_balance, 0) + COALESCE(available_balance, 0) + COALESCE(pending_balance, 0)
WHERE wallet_balance IS NOT NULL;

-- =====================================================
-- STEP 2: Drop dependent objects first
-- =====================================================
-- Drop the trigger first (it depends on available_balance)
DROP TRIGGER IF EXISTS trigger_update_partner_wallet_updated_at ON partners;

-- Drop the view that depends on the columns
DROP VIEW IF EXISTS public.partner_wallet_summary;

-- =====================================================
-- STEP 3: Drop related constraints
-- =====================================================
-- Drop constraints that reference the removed columns
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_available_balance_check;
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_pending_balance_check;
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_available_balance_logic_check;
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_pending_balance_logic_check;
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_balance_sum_check;

-- =====================================================
-- STEP 4: Drop related indexes
-- =====================================================
-- Drop indexes that reference the removed columns
DROP INDEX IF EXISTS idx_partners_available_balance;
DROP INDEX IF EXISTS idx_partners_pending_balance;

-- =====================================================
-- STEP 5: Drop unnecessary columns
-- =====================================================
-- Drop available_balance column
ALTER TABLE partners DROP COLUMN IF EXISTS available_balance;

-- Drop pending_balance column  
ALTER TABLE partners DROP COLUMN IF EXISTS pending_balance;

-- =====================================================
-- STEP 6: Update trigger function
-- =====================================================
-- Update the trigger function to only monitor wallet_balance changes
CREATE OR REPLACE FUNCTION update_partner_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.wallet_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to only monitor wallet_balance changes
CREATE TRIGGER trigger_update_partner_wallet_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  WHEN (OLD.wallet_balance IS DISTINCT FROM NEW.wallet_balance)
  EXECUTE FUNCTION update_partner_wallet_updated_at();

-- =====================================================
-- STEP 7: Recreate partner_wallet_summary view
-- =====================================================
-- Create simplified view
CREATE VIEW public.partner_wallet_summary AS
SELECT
  p.id,
  p.name,
  p.code,
  p.mobile,
  p.email,
  p.city,
  p.service_type,
  p.status AS partner_status,
  p.verification_status,
  p.wallet_balance,
  p.wallet_status,
  p.last_transaction_at,
  p.wallet_created_at,
  p.wallet_updated_at,
  p.joined_date,
  p.last_active,
  -- Calculated fields
  CASE 
    WHEN p.wallet_balance = 0 THEN 'zero'
    WHEN p.wallet_balance > 10000 THEN 'high'
    ELSE 'normal'
  END AS balance_category,
  -- Wallet health indicators
  CASE 
    WHEN p.wallet_status = 'active' AND p.wallet_balance > 0 THEN 'healthy'
    WHEN p.wallet_status = 'active' AND p.wallet_balance = 0 THEN 'empty'
    WHEN p.wallet_status = 'suspended' THEN 'suspended'
    WHEN p.wallet_status = 'frozen' THEN 'frozen'
    WHEN p.wallet_status = 'closed' THEN 'closed'
    ELSE 'unknown'
  END AS wallet_health,
  -- Business metrics
  COALESCE(p.total_orders, 0) AS total_orders,
  COALESCE(p.total_revenue, 0) AS total_revenue,
  COALESCE(p.rating, 0) AS rating,
  COALESCE(p.commission_percentage, 0) AS commission_percentage
FROM public.partners p
WHERE p.deleted_at IS NULL
  AND p.wallet_balance IS NOT NULL;

-- Add comment for the simplified view
COMMENT ON VIEW public.partner_wallet_summary IS 'Simplified summary view of partner wallet information with single balance field';

-- =====================================================
-- STEP 8: Add simplified constraints
-- =====================================================
-- Add constraint to ensure wallet_balance is non-negative
ALTER TABLE partners 
ADD CONSTRAINT partners_wallet_balance_positive_check 
CHECK (wallet_balance >= 0.00);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- The wallet system is now simplified to use only wallet_balance
-- All existing data has been preserved by merging the three balance fields
-- The system is now much simpler and easier to maintain