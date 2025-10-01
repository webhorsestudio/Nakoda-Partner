-- Migration: Add Missing Columns to Call Logs Table
-- Purpose: Add missing columns that are needed for the masked calling system
-- Date: 2025-01-17

-- =====================================================
-- STEP 1: Add Missing Core Columns
-- =====================================================

-- Add caller_number column if missing
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS caller_number VARCHAR(20);

-- Add called_number column if missing  
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS called_number VARCHAR(20);

-- Add uuid column if missing
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS uuid VARCHAR(100);

-- =====================================================
-- STEP 2: Add Missing Call Detail Columns
-- =====================================================

-- Add call_type column if missing
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS call_type VARCHAR(50) DEFAULT 'customer_to_partner';

-- Add end_time column if missing
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- Add duration column if missing
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Add call_quality column if missing
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS call_quality VARCHAR(20) DEFAULT 'unknown';

-- Add notes column if missing
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add transfer_type column if missing
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS transfer_type VARCHAR(50);

-- Add transfer_destination column if missing
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS transfer_destination VARCHAR(100);

-- Add failover_used column if missing
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS failover_used BOOLEAN DEFAULT FALSE;

-- Add metadata column if missing
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add updated_at column if missing
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- STEP 3: Add Missing Constraints
-- =====================================================

-- Add call_type constraint if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'call_logs_call_type_check'
    ) THEN
        ALTER TABLE call_logs ADD CONSTRAINT call_logs_call_type_check 
        CHECK (call_type IN ('customer_to_partner', 'partner_to_customer', 'support_call', 'delivery_call'));
    END IF;
END $$;

-- Add call_quality constraint if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'call_logs_call_quality_check'
    ) THEN
        ALTER TABLE call_logs ADD CONSTRAINT call_logs_call_quality_check 
        CHECK (call_quality IN ('excellent', 'good', 'fair', 'poor', 'unknown'));
    END IF;
END $$;

-- =====================================================
-- STEP 4: Add Missing Indexes
-- =====================================================

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_call_logs_uuid ON call_logs(uuid);
CREATE INDEX IF NOT EXISTS idx_call_logs_caller_number ON call_logs(caller_number);
CREATE INDEX IF NOT EXISTS idx_call_logs_called_number ON call_logs(called_number);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_type ON call_logs(call_type);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_quality ON call_logs(call_quality);

-- Add composite indexes
CREATE INDEX IF NOT EXISTS idx_call_logs_partner_status ON call_logs(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_call_logs_order_type ON call_logs(order_id, call_type);

-- =====================================================
-- STEP 5: Create Missing Views
-- =====================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS active_calls;
DROP VIEW IF EXISTS call_statistics;

-- Create active_calls view
CREATE OR REPLACE VIEW active_calls AS
SELECT 
    cl.id,
    cl.call_id,
    cl.uuid,
    cl.caller_number,
    cl.called_number,
    cl.partner_id,
    cl.order_id,
    cl.call_type,
    cl.status,
    cl.start_time,
    cl.duration,
    cl.transfer_destination,
    p.name as partner_name,
    o.title as order_title,
    o.customer_name
FROM call_logs cl
LEFT JOIN partners p ON cl.partner_id = p.id
LEFT JOIN orders o ON cl.order_id = o.id
WHERE cl.status IN ('initiated', 'ringing', 'connected')
ORDER BY cl.start_time DESC;

-- Create call_statistics view
CREATE OR REPLACE VIEW call_statistics AS
SELECT 
    DATE(start_time) as call_date,
    call_type,
    status,
    COUNT(*) as call_count,
    AVG(duration) as avg_duration,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_calls,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_calls
FROM call_logs
WHERE start_time IS NOT NULL
GROUP BY DATE(start_time), call_type, status
ORDER BY call_date DESC;

-- =====================================================
-- STEP 6: Create Missing Functions
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_call_status(VARCHAR(100), VARCHAR(50), TIMESTAMP WITH TIME ZONE, INTEGER, TEXT);

-- Create function to update call status
CREATE OR REPLACE FUNCTION update_call_status(
    p_call_id VARCHAR(100),
    p_status VARCHAR(50),
    p_end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_duration INTEGER DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE call_logs 
    SET 
        status = p_status,
        end_time = COALESCE(p_end_time, end_time),
        duration = COALESCE(p_duration, duration),
        notes = COALESCE(p_notes, notes),
        updated_at = NOW()
    WHERE call_id = p_call_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_partner_call_logs(INTEGER, INTEGER, INTEGER);

-- Create function to get call logs for a partner
CREATE OR REPLACE FUNCTION get_partner_call_logs(
    p_partner_id INTEGER,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    call_id VARCHAR(100),
    caller_number VARCHAR(20),
    called_number VARCHAR(20),
    call_type VARCHAR(50),
    status VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    order_title TEXT,
    customer_name VARCHAR(200)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.call_id,
        cl.caller_number,
        cl.called_number,
        cl.call_type,
        cl.status,
        cl.start_time,
        cl.duration,
        o.title,
        o.customer_name
    FROM call_logs cl
    LEFT JOIN orders o ON cl.order_id = o.id
    WHERE cl.partner_id = p_partner_id
    ORDER BY cl.start_time DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 7: Enable RLS and Policies
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'call_logs' AND policyname = 'Authenticated users can view call logs'
    ) THEN
        CREATE POLICY "Authenticated users can view call logs" ON call_logs
        FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'call_logs' AND policyname = 'Authenticated users can insert call logs'
    ) THEN
        CREATE POLICY "Authenticated users can insert call logs" ON call_logs
        FOR INSERT WITH CHECK (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'call_logs' AND policyname = 'Authenticated users can update call logs'
    ) THEN
        CREATE POLICY "Authenticated users can update call logs" ON call_logs
        FOR UPDATE USING (true);
    END IF;
END $$;

-- =====================================================
-- STEP 8: Grant Permissions
-- =====================================================

-- Grant access to views
GRANT SELECT ON active_calls TO authenticated;
GRANT SELECT ON call_statistics TO authenticated;

-- Grant access to functions
GRANT EXECUTE ON FUNCTION update_call_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_partner_call_logs TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- ✅ Added all missing columns
-- ✅ Added constraints
-- ✅ Created indexes
-- ✅ Created views
-- ✅ Created functions
-- ✅ Enabled RLS and policies
-- ✅ Granted permissions
