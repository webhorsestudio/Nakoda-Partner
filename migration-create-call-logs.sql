-- Migration: Create Call Logs Table for Masked Calling
-- Purpose: Store call logs for Acefone API Dialplan masked calling
-- Date: 2025-01-17

-- =====================================================
-- STEP 1: Create Call Logs Table
-- =====================================================

CREATE TABLE IF NOT EXISTS call_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Acefone call identifiers
    call_id VARCHAR(100) NOT NULL,
    uuid VARCHAR(100),
    
    -- Call participants (masked numbers)
    caller_number VARCHAR(20) NOT NULL,
    called_number VARCHAR(20) NOT NULL,
    
    -- Call routing information
    partner_id INTEGER REFERENCES partners(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    -- Call details
    call_type VARCHAR(50) DEFAULT 'customer_to_partner' 
        CHECK (call_type IN ('customer_to_partner', 'partner_to_customer', 'support_call', 'delivery_call')),
    status VARCHAR(50) DEFAULT 'initiated'
        CHECK (status IN ('initiated', 'ringing', 'connected', 'failed', 'completed', 'busy', 'no_answer', 'cancelled')),
    
    -- Timestamps
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- Duration in seconds
    
    -- Call quality and notes
    call_quality VARCHAR(20) DEFAULT 'unknown'
        CHECK (call_quality IN ('excellent', 'good', 'fair', 'poor', 'unknown')),
    notes TEXT,
    
    -- Technical details
    transfer_type VARCHAR(50), -- 'number', 'agent', 'ivr', etc.
    transfer_destination VARCHAR(100), -- Where the call was transferred to
    failover_used BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Create Indexes for Performance
-- =====================================================

-- Index for call_id lookups
CREATE INDEX IF NOT EXISTS idx_call_logs_call_id ON call_logs(call_id);

-- Index for UUID lookups
CREATE INDEX IF NOT EXISTS idx_call_logs_uuid ON call_logs(uuid);

-- Index for partner-based queries
CREATE INDEX IF NOT EXISTS idx_call_logs_partner_id ON call_logs(partner_id);

-- Index for order-based queries
CREATE INDEX IF NOT EXISTS idx_call_logs_order_id ON call_logs(order_id);

-- Index for call status queries
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);

-- Index for call type queries
CREATE INDEX IF NOT EXISTS idx_call_logs_call_type ON call_logs(call_type);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_call_logs_start_time ON call_logs(start_time);

-- Composite index for partner + status queries
CREATE INDEX IF NOT EXISTS idx_call_logs_partner_status ON call_logs(partner_id, status);

-- Composite index for order + call_type queries
CREATE INDEX IF NOT EXISTS idx_call_logs_order_type ON call_logs(order_id, call_type);

-- =====================================================
-- STEP 3: Create Views for Common Queries
-- =====================================================

-- View for active calls
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

-- View for call statistics
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
-- STEP 4: Create Helper Functions
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
-- STEP 5: Enable Row Level Security
-- =====================================================

-- Enable RLS
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view call logs
CREATE POLICY "Authenticated users can view call logs" ON call_logs
FOR SELECT USING (true);

-- Policy for authenticated users to insert call logs
CREATE POLICY "Authenticated users can insert call logs" ON call_logs
FOR INSERT WITH CHECK (true);

-- Policy for authenticated users to update call logs
CREATE POLICY "Authenticated users can update call logs" ON call_logs
FOR UPDATE USING (true);

-- =====================================================
-- STEP 6: Grant Permissions
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

-- ✅ Created call_logs table with comprehensive fields
-- ✅ Added performance indexes
-- ✅ Created useful views for active calls and statistics
-- ✅ Added helper functions for common operations
-- ✅ Enabled Row Level Security
-- ✅ Granted appropriate permissions