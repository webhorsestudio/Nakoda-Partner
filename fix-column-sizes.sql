-- Fix column sizes that are too small for the data being inserted
-- This will resolve the "value too long for type character varying(10)" error

-- Fix pin_code column size (some pin codes can be longer)
ALTER TABLE orders ALTER COLUMN pin_code TYPE VARCHAR(20);

-- Fix stage_semantic_id column size if needed
ALTER TABLE orders ALTER COLUMN stage_semantic_id TYPE VARCHAR(20);

-- Verify the changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('pin_code', 'stage_semantic_id', 'currency');
