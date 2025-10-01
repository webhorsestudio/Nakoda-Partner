-- Migration: Simple Call Logs Table Check
-- Purpose: Check the actual column names in call_logs table
-- Date: 2025-01-17

-- =====================================================
-- STEP 1: Check if Table Exists
-- =====================================================

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'call_logs'
) as table_exists;

-- =====================================================
-- STEP 2: Show All Columns
-- =====================================================

SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'call_logs' 
ORDER BY ordinal_position;

-- =====================================================
-- STEP 3: Count Columns
-- =====================================================

SELECT COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'call_logs';

-- =====================================================
-- STEP 4: Check Specific Columns We Need
-- =====================================================

-- Check if the columns we need exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_logs' AND column_name = 'caller_number'
    ) THEN 'EXISTS' ELSE 'MISSING' END as caller_number_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_logs' AND column_name = 'called_number'
    ) THEN 'EXISTS' ELSE 'MISSING' END as called_number_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_logs' AND column_name = 'uuid'
    ) THEN 'EXISTS' ELSE 'MISSING' END as uuid_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_logs' AND column_name = 'call_id'
    ) THEN 'EXISTS' ELSE 'MISSING' END as call_id_status;

-- =====================================================
-- INSTRUCTIONS
-- =====================================================

-- Run this migration to see:
-- 1. If the call_logs table exists
-- 2. What columns actually exist
-- 3. Which required columns are missing
