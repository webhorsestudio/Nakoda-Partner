-- Simple Migration: Increase Column Sizes
-- Run this in your Supabase SQL Editor

BEGIN;

-- Increase service and business field sizes
ALTER TABLE orders ALTER COLUMN service_type TYPE VARCHAR(500);
ALTER TABLE orders ALTER COLUMN city TYPE VARCHAR(200);
ALTER TABLE orders ALTER COLUMN order_date TYPE VARCHAR(200);
ALTER TABLE orders ALTER COLUMN order_time TYPE VARCHAR(200);

-- Increase UTM marketing field sizes
ALTER TABLE orders ALTER COLUMN utm_source TYPE VARCHAR(500);
ALTER TABLE orders ALTER COLUMN utm_medium TYPE VARCHAR(500);
ALTER TABLE orders ALTER COLUMN utm_campaign TYPE VARCHAR(500);
ALTER TABLE orders ALTER COLUMN utm_content TYPE VARCHAR(500);
ALTER TABLE orders ALTER COLUMN utm_term TYPE VARCHAR(500);

COMMIT;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
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
