-- Create OTP store table for persistent OTP storage
CREATE TABLE IF NOT EXISTS otp_store (
  id SERIAL PRIMARY KEY,
  mobile VARCHAR(15) NOT NULL UNIQUE,
  otp VARCHAR(10) NOT NULL,
  expires_at BIGINT NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on mobile for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_store_mobile ON otp_store(mobile);

-- Create index on expires_at for cleanup operations
CREATE INDEX IF NOT EXISTS idx_otp_store_expires ON otp_store(expires_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE otp_store ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (you can restrict this further if needed)
CREATE POLICY "Allow all operations for authenticated users" ON otp_store
  FOR ALL USING (true);

-- Optional: Add a function to automatically clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_store WHERE expires_at < EXTRACT(EPOCH FROM NOW()) * 1000;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a cron job to run cleanup every 5 minutes
-- You can set this up in Supabase dashboard under Database > Functions
