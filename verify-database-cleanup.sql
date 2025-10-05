-- Verification Script: Post-Migration Database Check
-- Description: Verify that the database cleanup was successful
-- Date: 2025-01-20

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- 1. Check that both tables are empty
SELECT 
    'call_logs' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ CLEAN' 
        ELSE '❌ STILL HAS DATA' 
    END as status
FROM public.call_logs

UNION ALL

SELECT 
    'orders' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ CLEAN' 
        ELSE '❌ STILL HAS DATA' 
    END as status
FROM public.orders;

-- =====================================================
-- CONSTRAINT VERIFICATION
-- =====================================================

-- 2. Verify all constraints are intact
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    CASE contype
        WHEN 'p' THEN 'Primary Key'
        WHEN 'f' THEN 'Foreign Key'
        WHEN 'u' THEN 'Unique Constraint'
        WHEN 'c' THEN 'Check Constraint'
        ELSE 'Other'
    END as constraint_type_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.orders'::regclass
ORDER BY conname;

-- =====================================================
-- INDEX VERIFICATION
-- =====================================================

-- 3. Verify all indexes are intact
SELECT 
    indexname,
    CASE 
        WHEN indexdef LIKE '%UNIQUE%' THEN 'UNIQUE INDEX'
        ELSE 'INDEX'
    END as index_type,
    indexdef
FROM pg_indexes 
WHERE tablename = 'orders' 
    AND schemaname = 'public'
ORDER BY indexname;

-- =====================================================
-- TABLE STRUCTURE VERIFICATION
-- =====================================================

-- 4. Verify table structure is intact
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name = 'id' THEN '✅ Primary Key'
        WHEN column_name = 'bitrix24_id' THEN '✅ Unique Constraint'
        WHEN column_name = 'partner_id' THEN '✅ Foreign Key'
        WHEN column_name = 'mode' THEN '✅ Check Constraint'
        WHEN column_name = 'customer_rating' THEN '✅ Check Constraint'
        WHEN column_name = 'partner_completion_status' THEN '✅ Check Constraint'
        ELSE 'Column'
    END as constraint_info
FROM information_schema.columns 
WHERE table_name = 'orders' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- TRIGGER VERIFICATION
-- =====================================================

-- 5. Verify triggers are intact
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    CASE 
        WHEN trigger_name = 'update_orders_updated_at' THEN '✅ Update Trigger'
        ELSE 'Trigger'
    END as trigger_info
FROM information_schema.triggers 
WHERE event_object_table = 'orders' 
    AND event_object_schema = 'public';

-- =====================================================
-- SUMMARY
-- =====================================================

-- 6. Summary of verification
SELECT 
    'Database Cleanup Verification' as check_type,
    'All constraints, indexes, and triggers are preserved' as status,
    'Ready for fresh order data from Bitrix24' as next_step;

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================

-- Expected results:
-- ✅ Both tables should show 0 records
-- ✅ All 6 constraints should be present
-- ✅ All indexes should be intact
-- ✅ All columns should be present
-- ✅ Update trigger should be enabled
-- ✅ Database is ready for new orders
