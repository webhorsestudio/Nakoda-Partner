-- Migration: Add Index on Mobile Field for Better Performance
-- This script adds an index on the mobile field to improve query performance

-- Check if the index already exists
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename = 'partners' 
AND indexname LIKE '%mobile%';

-- Add index on mobile field if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_partners_mobile ON partners(mobile);

-- Verify the index was created
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename = 'partners' 
AND indexname LIKE '%mobile%';

-- Show all indexes on the partners table
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename = 'partners'
ORDER BY indexname;

-- Test query performance (optional - run this to see the execution plan)
-- EXPLAIN (ANALYZE, BUFFERS) 
-- SELECT * FROM partners WHERE mobile = '+1-555-0101';
