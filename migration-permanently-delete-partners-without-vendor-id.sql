-- Migration: Permanently delete partners without vendor_id
-- Description: Permanently removes all partners who don't have a vendor_id value
-- Date: 2025-01-27

-- Step 1: Show analysis of partners without vendor_id
SELECT 
  'ANALYSIS: Partners without vendor_id' as analysis_type,
  COUNT(*) as partners_without_vendor_id,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_partners_without_vendor_id,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as already_deleted_partners_without_vendor_id
FROM partners 
WHERE vendor_id IS NULL OR vendor_id = '';

-- Step 2: Show detailed breakdown of partners without vendor_id
SELECT 
  'DETAILED BREAKDOWN' as breakdown_type,
  id,
  name,
  mobile,
  city,
  service_type,
  status,
  created_at,
  CASE 
    WHEN deleted_at IS NULL THEN 'ACTIVE'
    ELSE 'ALREADY DELETED'
  END as current_status
FROM partners 
WHERE vendor_id IS NULL OR vendor_id = ''
ORDER BY created_at DESC;

-- Step 3: Show partners with vendor_id for comparison
SELECT 
  'COMPARISON: Partners with vendor_id' as comparison_type,
  COUNT(*) as partners_with_vendor_id,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_partners_with_vendor_id
FROM partners 
WHERE vendor_id IS NOT NULL AND vendor_id != '';

-- Step 4: Permanently delete partners without vendor_id
DELETE FROM partners 
WHERE vendor_id IS NULL OR vendor_id = '';

-- Step 5: Show results of the cleanup
SELECT 
  'CLEANUP RESULTS' as results_type,
  COUNT(*) as total_partners,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_partners,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_partners,
  COUNT(CASE WHEN deleted_at IS NULL AND vendor_id IS NOT NULL AND vendor_id != '' THEN 1 END) as active_partners_with_vendor_id,
  COUNT(CASE WHEN deleted_at IS NULL AND (vendor_id IS NULL OR vendor_id = '') THEN 1 END) as active_partners_without_vendor_id
FROM partners;

-- Step 6: Verify no partners remain without vendor_id
SELECT 
  'VERIFICATION: Partners without vendor_id' as verification_type,
  COUNT(*) as count
FROM partners 
WHERE vendor_id IS NULL OR vendor_id = '';

-- Step 7: Show final statistics
SELECT 
  'FINAL STATISTICS' as stats_type,
  COUNT(*) as total_partners,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_partners,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_partners,
  SUM(CASE WHEN deleted_at IS NULL THEN wallet_balance ELSE 0 END) as total_active_wallet_balance,
  SUM(CASE WHEN deleted_at IS NULL THEN total_orders ELSE 0 END) as total_active_orders,
  SUM(CASE WHEN deleted_at IS NULL THEN total_revenue ELSE 0 END) as total_active_revenue
FROM partners;
