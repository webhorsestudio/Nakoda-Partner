-- Migration: Clean Orders Database
-- Description: Remove all order data to start fresh while preserving table structure
-- Date: 2025-01-20
-- Author: System Migration

-- =====================================================
-- SAFETY CHECKS AND BACKUP RECOMMENDATIONS
-- =====================================================

-- IMPORTANT: Before running this migration:
-- 1. Create a backup of your database
-- 2. Export any critical order data you want to preserve
-- 3. Ensure no active operations are running on the orders table

-- =====================================================
-- STEP 1: DISABLE TRIGGERS TEMPORARILY
-- =====================================================

-- Disable the update trigger to prevent unnecessary updated_at changes during cleanup
ALTER TABLE public.orders DISABLE TRIGGER update_orders_updated_at;

-- =====================================================
-- STEP 2: CLEAR DEPENDENT DATA FIRST
-- =====================================================

-- Clear dependent tables that reference orders
-- This prevents foreign key constraint violations

-- Clear call_logs table (references orders.id)
DELETE FROM public.call_logs;

-- Clear any other dependent tables that might reference orders
-- Add more DELETE statements here if you have other dependent tables
-- 
-- To find all tables that reference orders, run this query:
-- SELECT 
--     tc.table_name, 
--     kcu.column_name, 
--     ccu.table_name AS foreign_table_name,
--     ccu.column_name AS foreign_column_name 
-- FROM 
--     information_schema.table_constraints AS tc 
--     JOIN information_schema.key_column_usage AS kcu
--       ON tc.constraint_name = kcu.constraint_name
--       AND tc.table_schema = kcu.table_schema
--     JOIN information_schema.constraint_column_usage AS ccu
--       ON ccu.constraint_name = tc.constraint_name
--       AND ccu.table_schema = tc.table_schema
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--   AND ccu.table_name = 'orders';

-- =====================================================
-- STEP 3: CLEAR ALL ORDER DATA
-- =====================================================

-- Now remove all orders from the table
-- All dependent records have been cleared, so no foreign key violations
DELETE FROM public.orders;

-- =====================================================
-- STEP 4: RESET SEQUENCES AND COUNTERS
-- =====================================================

-- Reset any auto-incrementing sequences (if any exist)
-- Note: UUIDs don't need sequence reset, but this is here for completeness

-- =====================================================
-- STEP 5: RE-ENABLE TRIGGERS
-- =====================================================

-- Re-enable the update trigger
ALTER TABLE public.orders ENABLE TRIGGER update_orders_updated_at;

-- =====================================================
-- STEP 6: VERIFY CLEANUP
-- =====================================================

-- Verify that dependent tables are empty
SELECT 
    'Call Logs Count' as table_name,
    COUNT(*) as record_count
FROM public.call_logs;

-- Verify that the orders table is empty
SELECT 
    'Orders Count' as table_name,
    COUNT(*) as record_count
FROM public.orders;

-- Verify table structure is intact
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify indexes are still in place
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'orders' 
    AND schemaname = 'public'
ORDER BY indexname;

-- Verify constraints are still in place
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.orders'::regclass
ORDER BY conname;

-- =====================================================
-- STEP 7: OPTIONAL - VACUUM AND ANALYZE
-- =====================================================

-- NOTE: VACUUM cannot run inside a transaction block
-- Run these commands separately after the migration completes:

-- Clean up disk space and update statistics (run these separately):
-- VACUUM ANALYZE public.call_logs;
-- VACUUM ANALYZE public.orders;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- The orders table is now clean and ready for new data
-- All constraints, indexes, and triggers are preserved
-- You can now start adding new orders from Bitrix24

-- =====================================================
-- POST-MIGRATION VERIFICATION
-- =====================================================

-- Run these queries to confirm everything is clean:
-- SELECT COUNT(*) FROM public.call_logs; -- Should return 0
-- SELECT COUNT(*) FROM public.orders; -- Should return 0

-- =====================================================
-- POST-MIGRATION CLEANUP (Run Separately)
-- =====================================================

-- After the migration completes successfully, run these commands separately:
-- (VACUUM cannot run inside a transaction block)

-- Connect to your database and run:
-- VACUUM ANALYZE public.call_logs;
-- VACUUM ANALYZE public.orders;

-- This will clean up disk space and update table statistics

-- =====================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =====================================================

-- If you need to rollback this migration:
-- 1. Restore from your database backup
-- 2. Or re-import any exported data you want to preserve

-- =====================================================
-- NOTES
-- =====================================================

-- This migration:
-- ✅ Removes all call_logs data (dependent table)
-- ✅ Removes all order data
-- ✅ Preserves table structure
-- ✅ Preserves all constraints
-- ✅ Preserves all indexes
-- ✅ Preserves all triggers
-- ⚠️ VACUUM commands must be run separately (outside transaction)

-- Both tables are now ready for fresh data from Bitrix24!
-- Run VACUUM ANALYZE commands separately after this migration completes.
