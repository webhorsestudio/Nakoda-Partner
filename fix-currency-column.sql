-- Fix currency column size to prevent future "value too long" errors
ALTER TABLE orders ALTER COLUMN currency TYPE VARCHAR(20);

-- Verify the change
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'currency';
