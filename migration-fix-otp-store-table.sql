-- Migration: Fix OTP Store Table Structure
-- This script ensures the OTP store table exists and has the correct structure
-- Based on the actual table structure: otp_store (Supabase automatically handles public schema)

-- Check if otp_store table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'otp_store') THEN
        RAISE NOTICE 'Creating otp_store table...';
        
        -- Create OTP store table for persistent OTP storage
        CREATE TABLE otp_store (
          id SERIAL PRIMARY KEY,
          mobile VARCHAR(15) NOT NULL UNIQUE,
          otp VARCHAR(10) NOT NULL,
          expires_at BIGINT NOT NULL,
          attempts INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'otp_store table created successfully';
    ELSE
        RAISE NOTICE 'otp_store table already exists';
    END IF;
END $$;

-- Check and create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_otp_store_mobile ON otp_store(mobile);
CREATE INDEX IF NOT EXISTS idx_otp_store_expires ON otp_store(expires_at);

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'otp_store' 
ORDER BY ordinal_position;

-- Check indexes
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename = 'otp_store'
ORDER BY indexname;

-- Check constraints
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'otp_store';

-- Test table access
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO test_count FROM otp_store;
    RAISE NOTICE 'Table access test successful. Current OTP count: %', test_count;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Table access test failed: %', SQLERRM;
END $$;

-- Show current OTP store contents
SELECT 
  mobile,
  otp,
  expires_at,
  attempts,
  created_at,
  updated_at
FROM otp_store
ORDER BY created_at DESC
LIMIT 10;
