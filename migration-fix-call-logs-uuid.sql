-- Migration: Fix Call Logs Table - Add Missing UUID Column
-- Purpose: Add uuid column to existing call_logs table if it doesn't exist
-- Date: 2025-01-17

-- =====================================================
-- STEP 1: Add UUID Column if Missing
-- =====================================================

-- Add uuid column if it doesn't exist
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS uuid VARCHAR(100);

-- =====================================================
-- STEP 2: Add Other Missing Columns if Needed
-- =====================================================

-- Add other columns that might be missing
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS call_quality VARCHAR(20) DEFAULT 'unknown'
    CHECK (call_quality IN ('excellent', 'good', 'fair', 'poor', 'unknown'));

ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS transfer_type VARCHAR(50);

ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS transfer_destination VARCHAR(100);

ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS failover_used BOOLEAN DEFAULT FALSE;

ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- =====================================================
-- STEP 3: Update Constraints if Missing
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

-- Add status constraint if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'call_logs_status_check'
    ) THEN
        ALTER TABLE call_logs ADD CONSTRAINT call_logs_status_check 
        CHECK (status IN ('initiated', 'ringing', 'connected', 'failed', 'completed', 'busy', 'no_answer', 'cancelled'));
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
-- STEP 4: Create Missing Indexes
-- =====================================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_call_logs_call_id ON call_logs(call_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_uuid ON call_logs(uuid);
CREATE INDEX IF NOT EXISTS idx_call_logs_partner_id ON call_logs(partner_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_order_id ON call_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_type ON call_logs(call_type);
CREATE INDEX IF NOT EXISTS idx_call_logs_start_time ON call_logs(start_time);
CREATE INDEX IF NOT EXISTS idx_call_logs_partner_status ON call_logs(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_call_logs_order_type ON call_logs(order_id, call_type);

-- =====================================================
-- STEP 5: Create Missing Views
-- =====================================================

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

-- Function to update call status
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

-- Function to get call logs for a partner
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

-- ✅ Added missing uuid column
-- ✅ Added other missing columns
-- ✅ Updated constraints
-- ✅ Created missing indexes
-- ✅ Created missing views
-- ✅ Created missing functions
-- ✅ Enabled RLS and policies
-- ✅ Granted permissions
