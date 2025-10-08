-- Migration: Permanently delete ALL partners
-- Description: Permanently removes ALL partners from the database to start fresh
-- Date: 2025-01-27

-- Step 1: Show current partner count
SELECT 
  'CURRENT STATE: All partners' as analysis_type,
  COUNT(*) as total_partners,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_partners,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_partners,
  COUNT(CASE WHEN vendor_id IS NOT NULL AND vendor_id != '' THEN 1 END) as partners_with_vendor_id,
  COUNT(CASE WHEN vendor_id IS NULL OR vendor_id = '' THEN 1 END) as partners_without_vendor_id
FROM partners;

-- Step 2: Show wallet balance summary before deletion
SELECT 
  'WALLET SUMMARY BEFORE DELETION' as summary_type,
  COUNT(*) as partners_with_wallet,
  SUM(wallet_balance) as total_wallet_balance,
  SUM(total_orders) as total_orders,
  SUM(total_revenue) as total_revenue
FROM partners 
WHERE wallet_balance > 0 OR total_orders > 0 OR total_revenue > 0;

-- Step 3: Show sample of partners that will be deleted
SELECT 
  'SAMPLE PARTNERS TO BE DELETED' as sample_type,
  id,
  name,
  mobile,
  city,
  service_type,
  status,
  vendor_id,
  wallet_balance,
  total_orders,
  total_revenue,
  created_at
FROM partners 
ORDER BY created_at DESC
LIMIT 10;

-- Step 4: Permanently delete ALL partners
DELETE FROM partners;

-- Step 5: Verify all partners are deleted
SELECT 
  'VERIFICATION: Partners remaining' as verification_type,
  COUNT(*) as remaining_partners
FROM partners;

-- Step 6: Reset the sequence to start from 1
-- This ensures new partners start with id = 1
SELECT setval('partners_id_seq', 1, false);

-- Step 7: Verify sequence reset
SELECT 
  'SEQUENCE RESET VERIFICATION' as sequence_type,
  last_value as current_sequence_value
FROM partners_id_seq;

-- Step 8: Show final empty state
SELECT 
  'FINAL STATE: Empty partners table' as final_state,
  COUNT(*) as total_partners,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_partners,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_partners
FROM partners;
