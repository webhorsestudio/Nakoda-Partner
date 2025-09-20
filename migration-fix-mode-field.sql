-- Migration: Fix Mode Field Data
-- Date: 2024-12-19
-- Purpose: Clean up mode field that contains commission percentage values instead of actual mode values

-- =====================================================
-- STEP 1: Identify and fix mode field issues
-- =====================================================

-- First, let's see what we're dealing with
-- This query will show us records where mode contains numeric values (likely commission percentages)
SELECT 
    id, 
    title, 
    mode, 
    commission_percentage,
    CASE 
        WHEN mode ~ '^[0-9]+$' THEN 'COMMISSION_PERCENTAGE'
        WHEN mode IS NULL THEN 'NULL'
        ELSE 'VALID_MODE'
    END as mode_status,
    COUNT(*) OVER() as total_records
FROM orders 
WHERE mode IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- STEP 2: Clean up mode field
-- =====================================================

-- Set mode to NULL for records where mode contains only numeric values (commission percentages)
-- This is safe because these records don't have actual mode information
UPDATE orders 
SET mode = NULL 
WHERE mode ~ '^[0-9]+$' 
  AND mode IS NOT NULL;

-- =====================================================
-- STEP 3: Add validation constraint
-- =====================================================

-- Add a check constraint to prevent future commission percentage values in mode field
-- This will ensure mode field only contains valid payment mode values
ALTER TABLE orders 
ADD CONSTRAINT check_mode_valid 
CHECK (
    mode IS NULL 
    OR mode ~ '^[A-Za-z\s]+$'  -- Only letters and spaces allowed
    OR mode IN ('COD', 'online', 'UPI', 'card', 'wallet', 'net banking', 'cash', 'credit card', 'debit card')
);

-- =====================================================
-- STEP 4: Create index for better performance
-- =====================================================

-- Create index on mode field for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_mode ON orders(mode) WHERE mode IS NOT NULL;

-- =====================================================
-- STEP 5: Verify the fix
-- =====================================================

-- Check the results after cleanup
SELECT 
    'After Cleanup' as status,
    COUNT(*) as total_orders,
    COUNT(mode) as orders_with_mode,
    COUNT(*) - COUNT(mode) as orders_without_mode
FROM orders;

-- Show sample of remaining mode values
SELECT DISTINCT mode, COUNT(*) as count
FROM orders 
WHERE mode IS NOT NULL
GROUP BY mode
ORDER BY count DESC;

-- =====================================================
-- STEP 6: Add helpful comments
-- =====================================================

-- Add comment to document the mode field purpose
COMMENT ON COLUMN orders.mode IS 'Payment mode (COD, online, UPI, card, wallet, etc.) - extracted from Bitrix24 title';
