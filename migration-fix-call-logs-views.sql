-- Migration: Fix Call Logs Views - Column Name Issues
-- Purpose: Fix view definitions to match actual table column names
-- Date: 2025-01-17

-- =====================================================
-- STEP 1: Check and Fix Column Names
-- =====================================================

-- First, let's see what columns actually exist in the call_logs table
-- Run this query to check the actual column names:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'call_logs' ORDER BY ordinal_position;

-- =====================================================
-- STEP 2: Drop Existing Views
-- =====================================================

-- Drop the problematic views
DROP VIEW IF EXISTS active_calls;
DROP VIEW IF EXISTS call_statistics;

-- =====================================================
-- STEP 3: Recreate Views with Correct Column Names
-- =====================================================

-- Create active_calls view with correct column references
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

-- Create call_statistics view with correct column references
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
-- STEP 4: Fix Function Definitions
-- =====================================================

-- Drop and recreate the function with correct column names
DROP FUNCTION IF EXISTS get_partner_call_logs(INTEGER, INTEGER, INTEGER);

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
-- STEP 5: Grant Permissions
-- =====================================================

-- Grant access to views
GRANT SELECT ON active_calls TO authenticated;
GRANT SELECT ON call_statistics TO authenticated;

-- Grant access to functions
GRANT EXECUTE ON FUNCTION get_partner_call_logs TO authenticated;

-- =====================================================
-- STEP 6: Test the Views
-- =====================================================

-- Test the views to make sure they work
-- You can run these queries to test:

-- Test active_calls view:
-- SELECT * FROM active_calls LIMIT 5;

-- Test call_statistics view:
-- SELECT * FROM call_statistics LIMIT 5;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- ✅ Dropped problematic views
-- ✅ Recreated views with correct column references
-- ✅ Fixed function definitions
-- ✅ Granted permissions
-- ✅ Views should now work correctly
