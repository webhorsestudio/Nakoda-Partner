-- Migration: Fix Duplicate Partners
-- Description: Identifies and handles duplicate partners with same name, location, and mobile number
-- Date: 2025-01-27

-- Step 1: Identify duplicate partners based on name, location, and mobile
-- This query will show all duplicate groups
SELECT 
  'DUPLICATE ANALYSIS' as analysis_type,
  name,
  location,
  mobile,
  COUNT(*) as duplicate_count,
  array_agg(id ORDER BY created_at ASC) as partner_ids,
  array_agg(created_at ORDER BY created_at ASC) as created_dates,
  array_agg(status ORDER BY created_at ASC) as statuses,
  array_agg(wallet_balance ORDER BY created_at ASC) as wallet_balances
FROM partners 
WHERE deleted_at IS NULL  -- Only consider non-deleted partners
  AND name IS NOT NULL 
  AND location IS NOT NULL 
  AND mobile IS NOT NULL
GROUP BY name, location, mobile
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, name;

-- Step 2: Create a temporary table to store the partners to keep (oldest by created_at)
CREATE TEMP TABLE partners_to_keep AS
SELECT DISTINCT ON (name, location, mobile)
  id,
  name,
  location,
  mobile,
  created_at,
  status,
  wallet_balance,
  total_orders,
  total_revenue,
  rating
FROM partners 
WHERE deleted_at IS NULL
  AND name IS NOT NULL 
  AND location IS NOT NULL 
  AND mobile IS NOT NULL
ORDER BY name, location, mobile, created_at ASC;

-- Step 3: Create a temporary table to store partners to merge/delete
CREATE TEMP TABLE partners_to_merge AS
SELECT 
  p.id,
  p.name,
  p.location,
  p.mobile,
  p.created_at,
  p.status,
  p.wallet_balance,
  p.total_orders,
  p.total_revenue,
  p.rating,
  pk.id as keep_id,
  pk.created_at as keep_created_at
FROM partners p
LEFT JOIN partners_to_keep pk ON (
  p.name = pk.name 
  AND p.location = pk.location 
  AND p.mobile = pk.mobile
)
WHERE p.deleted_at IS NULL
  AND p.name IS NOT NULL 
  AND p.location IS NOT NULL 
  AND p.mobile IS NOT NULL
  AND pk.id IS NOT NULL  -- This partner has duplicates
  AND p.id != pk.id;     -- This is not the partner we're keeping

-- Step 4: Show summary of what will be merged
SELECT 
  'MERGE SUMMARY' as summary_type,
  COUNT(*) as partners_to_merge,
  COUNT(DISTINCT CONCAT(name, '|', location, '|', mobile)) as duplicate_groups,
  SUM(wallet_balance) as total_wallet_to_transfer,
  SUM(total_orders) as total_orders_to_transfer,
  SUM(total_revenue) as total_revenue_to_transfer
FROM partners_to_merge;

-- Step 5: Update the partner to keep with aggregated data from duplicates
UPDATE partners 
SET 
  wallet_balance = (
    SELECT SUM(ptm.wallet_balance) 
    FROM partners_to_merge ptm 
    WHERE ptm.keep_id = partners.id
  ) + COALESCE(wallet_balance, 0),
  total_orders = (
    SELECT SUM(ptm.total_orders) 
    FROM partners_to_merge ptm 
    WHERE ptm.keep_id = partners.id
  ) + COALESCE(total_orders, 0),
  total_revenue = (
    SELECT SUM(ptm.total_revenue) 
    FROM partners_to_merge ptm 
    WHERE ptm.keep_id = partners.id
  ) + COALESCE(total_revenue, 0),
  rating = (
    SELECT AVG(ptm.rating) 
    FROM partners_to_merge ptm 
    WHERE ptm.keep_id = partners.id AND ptm.rating IS NOT NULL
  ),
  updated_at = NOW()
WHERE id IN (SELECT DISTINCT keep_id FROM partners_to_merge);

-- Step 6: Soft delete the duplicate partners (set deleted_at timestamp)
UPDATE partners 
SET 
  deleted_at = NOW(),
  updated_at = NOW(),
  notes = COALESCE(notes, '') || ' [MERGED: Duplicate partner data consolidated]'
WHERE id IN (SELECT id FROM partners_to_merge);

-- Step 7: Verify the cleanup
SELECT 
  'CLEANUP VERIFICATION' as verification_type,
  COUNT(*) as remaining_active_partners,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as soft_deleted_partners
FROM partners;

-- Step 8: Check for any remaining duplicates
SELECT 
  'REMAINING DUPLICATES CHECK' as check_type,
  name,
  location,
  mobile,
  COUNT(*) as count
FROM partners 
WHERE deleted_at IS NULL
  AND name IS NOT NULL 
  AND location IS NOT NULL 
  AND mobile IS NOT NULL
GROUP BY name, location, mobile
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Step 9: Show final partner statistics
SELECT 
  'FINAL STATISTICS' as stats_type,
  COUNT(*) as total_partners,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_partners,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_partners,
  SUM(CASE WHEN deleted_at IS NULL THEN wallet_balance ELSE 0 END) as total_active_wallet_balance,
  SUM(CASE WHEN deleted_at IS NULL THEN total_orders ELSE 0 END) as total_active_orders,
  SUM(CASE WHEN deleted_at IS NULL THEN total_revenue ELSE 0 END) as total_active_revenue
FROM partners;

-- Clean up temporary tables
DROP TABLE IF EXISTS partners_to_keep;
DROP TABLE IF EXISTS partners_to_merge;
