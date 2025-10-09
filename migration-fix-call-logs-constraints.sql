-- Migration: Fix Call Logs Database Constraints
-- Purpose: Remove NOT NULL constraint from partner_phone and customer_phone fields
-- Date: 2025-01-27

-- Remove NOT NULL constraint from partner_phone field
ALTER TABLE call_logs ALTER COLUMN partner_phone DROP NOT NULL;

-- Remove NOT NULL constraint from customer_phone field  
ALTER TABLE call_logs ALTER COLUMN customer_phone DROP NOT NULL;

-- Verify the changes
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'call_logs' 
AND column_name IN ('partner_phone', 'customer_phone')
ORDER BY column_name;
