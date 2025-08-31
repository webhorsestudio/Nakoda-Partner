-- Migration: Add Unique Constraint on Mobile Field
-- This script adds a unique constraint to prevent duplicate mobile numbers in the future

-- First, let's check if there are any existing duplicates that need to be resolved
SELECT 
  mobile,
  COUNT(*) as count,
  array_agg(id) as partner_ids,
  array_agg(name) as partner_names,
  array_agg(status) as partner_statuses
FROM partners 
WHERE mobile IS NOT NULL AND mobile != ''
GROUP BY mobile 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- If duplicates exist, you'll need to run the cleanup migration first
-- Then run this script to add the unique constraint

-- Add unique constraint on mobile field
-- Note: This will fail if there are still duplicate mobile numbers
ALTER TABLE partners 
ADD CONSTRAINT partners_mobile_unique UNIQUE (mobile);

-- Verify the constraint was added
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'partners' 
AND constraint_name = 'partners_mobile_unique';

-- Test the constraint by trying to insert a duplicate (should fail)
-- INSERT INTO partners (name, service_type, mobile, email) 
-- VALUES ('Test Duplicate', 'Test', '+1-555-0101', 'test@duplicate.com');
-- This should fail with a unique constraint violation error

-- Show the final table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN tc.constraint_type = 'UNIQUE' THEN 'UNIQUE'
    ELSE ''
  END as constraints
FROM information_schema.columns c
LEFT JOIN information_schema.constraint_column_usage ccu ON c.column_name = ccu.column_name
LEFT JOIN information_schema.table_constraints tc ON ccu.constraint_name = tc.constraint_name
WHERE c.table_name = 'partners' 
AND c.column_name = 'mobile';
