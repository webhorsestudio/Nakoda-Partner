-- Add new fields to existing orders table
-- Run this in your Supabase SQL Editor

BEGIN;

-- Add new financial and service fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_percentage VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS advance_amount VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS taxes_and_fees VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_date VARCHAR(200);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS time_slot VARCHAR(100);

COMMIT;

-- Verify the new columns were added
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN (
    'commission_percentage',
    'advance_amount', 
    'taxes_and_fees',
    'service_date',
    'time_slot'
)
ORDER BY column_name;
