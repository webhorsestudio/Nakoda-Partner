-- =====================================================
-- Migration Script: Increase Column Sizes
-- Purpose: Resolve VARCHAR(100) constraint issues
-- Date: 2025-01-XX
-- =====================================================

-- Start transaction for safe migration
BEGIN;

-- =====================================================
-- STEP 1: Increase VARCHAR column sizes
-- =====================================================

-- Service and business fields
ALTER TABLE orders ALTER COLUMN service_type TYPE VARCHAR(500);
ALTER TABLE orders ALTER COLUMN city TYPE VARCHAR(200);
ALTER TABLE orders ALTER COLUMN order_date TYPE VARCHAR(200);
ALTER TABLE orders ALTER COLUMN order_time TYPE VARCHAR(200);

-- UTM marketing fields
ALTER TABLE orders ALTER COLUMN utm_source TYPE VARCHAR(500);
ALTER TABLE orders ALTER COLUMN utm_medium TYPE VARCHAR(500);
ALTER TABLE orders ALTER COLUMN utm_campaign TYPE VARCHAR(500);
ALTER TABLE orders ALTER COLUMN utm_content TYPE VARCHAR(500);
ALTER TABLE orders ALTER COLUMN utm_term TYPE VARCHAR(500);

-- =====================================================
-- STEP 2: Verify the changes
-- =====================================================

-- Check updated column sizes
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    CASE 
        WHEN character_maximum_length >= 500 THEN '✅ Large (500+)'
        WHEN character_maximum_length >= 200 THEN '✅ Medium (200+)'
        WHEN character_maximum_length >= 100 THEN '⚠️ Small (100)'
        ELSE '❌ Very Small (<100)'
    END as size_category
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN (
    'service_type', 
    'city', 
    'order_date', 
    'order_time', 
    'utm_source', 
    'utm_medium', 
    'utm_campaign', 
    'utm_content', 
    'utm_term'
)
ORDER BY column_name;

-- =====================================================
-- STEP 3: Check for any remaining VARCHAR(100) constraints
-- =====================================================

-- Find any remaining VARCHAR(100) columns that might cause issues
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND data_type = 'character varying' 
AND character_maximum_length <= 100
AND column_name NOT IN ('pin_code', 'currency', 'stage_semantic_id') -- These should stay small
ORDER BY character_maximum_length, column_name;

-- =====================================================
-- STEP 4: Summary of changes
-- =====================================================

-- Display summary of what was changed
SELECT 
    'Migration Summary' as info,
    'Column sizes increased to handle longer values' as description,
    'No data loss - only constraints relaxed' as impact,
    'System will now handle longer service descriptions, city names, and UTM data' as benefit;

-- Commit the transaction
COMMIT;

-- =====================================================
-- POST-MIGRATION VERIFICATION
-- =====================================================

-- After running the migration, you can verify with:
-- SELECT COUNT(*) as total_orders FROM orders;
-- SELECT COUNT(*) as orders_with_long_service FROM orders WHERE LENGTH(service_type) > 100;
-- SELECT COUNT(*) as orders_with_long_city FROM orders WHERE LENGTH(city) > 100;

-- =====================================================
-- ROLLBACK PLAN (if needed)
-- =====================================================

/*
-- To rollback (if needed), run this:
BEGIN;
ALTER TABLE orders ALTER COLUMN service_type TYPE VARCHAR(100);
ALTER TABLE orders ALTER COLUMN city TYPE VARCHAR(100);
ALTER TABLE orders ALTER COLUMN order_date TYPE VARCHAR(100);
ALTER TABLE orders ALTER COLUMN order_time TYPE VARCHAR(100);
ALTER TABLE orders ALTER COLUMN utm_source TYPE VARCHAR(100);
ALTER TABLE orders ALTER COLUMN utm_medium TYPE VARCHAR(100);
ALTER TABLE orders ALTER COLUMN utm_campaign TYPE VARCHAR(100);
ALTER TABLE orders ALTER COLUMN utm_content TYPE VARCHAR(100);
ALTER TABLE orders ALTER COLUMN utm_term TYPE VARCHAR(100);
COMMIT;
*/

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. This migration is safe and won't lose any existing data
-- 2. VARCHAR(500) provides 5x more space than VARCHAR(100)
-- 3. Performance impact is minimal
-- 4. Can handle most real-world scenarios
-- 5. Easy to rollback if needed
