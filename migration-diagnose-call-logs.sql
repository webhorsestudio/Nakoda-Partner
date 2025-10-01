-- Migration: Diagnose Call Logs Table Structure
-- Purpose: Check the actual column names in call_logs table
-- Date: 2025-01-17

-- =====================================================
-- STEP 1: Check Table Structure
-- =====================================================

-- This query will show you the actual column names in the call_logs table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'call_logs' 
ORDER BY ordinal_position;

-- =====================================================
-- STEP 2: Check if Table Exists
-- =====================================================

-- Check if the call_logs table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'call_logs'
) as table_exists;

-- =====================================================
-- STEP 3: Show Table Schema
-- =====================================================

-- Show the complete table schema
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'call_logs'
ORDER BY ordinal_position;

-- =====================================================
-- STEP 4: Check Constraints
-- =====================================================

-- Check what constraints exist on the table
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    ccu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'call_logs';

-- =====================================================
-- STEP 5: Check Indexes
-- =====================================================

-- Check what indexes exist on the table
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'call_logs';

-- =====================================================
-- INSTRUCTIONS
-- =====================================================

-- Run this migration to see the actual structure of your call_logs table
-- Then we can fix the views based on the actual column names
