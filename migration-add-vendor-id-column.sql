-- Migration: Add vendor_id column to partners table
-- Description: Adds a new 'vendor_id' column alongside the existing 'code' column for safe migration
-- Date: 2025-01-27

-- Step 1: Add the new vendor_id column
ALTER TABLE public.partners 
ADD COLUMN vendor_id character varying(50) NULL;

-- Step 2: Add unique constraint on the new vendor_id column
ALTER TABLE public.partners 
ADD CONSTRAINT partners_vendor_id_key UNIQUE (vendor_id);

-- Step 3: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_partners_vendor_id ON public.partners USING btree (vendor_id);

-- Step 4: Add comment to document the column purpose
COMMENT ON COLUMN public.partners.vendor_id IS 'Unique vendor identifier for partner identification (new column)';
COMMENT ON COLUMN public.partners.code IS 'Legacy partner code (existing column - to be deprecated)';

-- Step 5: Verify the migration was successful
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'partners' 
AND column_name IN ('code', 'vendor_id')
ORDER BY column_name;

-- Step 6: Verify the unique constraint was added
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'partners' 
AND constraint_name IN ('partners_code_key', 'partners_vendor_id_key')
ORDER BY constraint_name;

-- Step 7: Show the updated table structure
SELECT 
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default,
  CASE 
    WHEN tc.constraint_type = 'UNIQUE' THEN 'UNIQUE'
    ELSE ''
  END as constraints
FROM information_schema.columns c
LEFT JOIN information_schema.constraint_column_usage ccu ON c.column_name = ccu.column_name AND c.table_name = ccu.table_name
LEFT JOIN information_schema.table_constraints tc ON ccu.constraint_name = tc.constraint_name AND tc.table_name = 'partners'
WHERE c.table_name = 'partners' 
AND c.column_name IN ('code', 'vendor_id')
ORDER BY c.column_name;
