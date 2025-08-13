-- Add partner column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS partner VARCHAR(200);

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'partner';
