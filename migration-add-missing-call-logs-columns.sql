-- Migration: Add Missing Fields to Call Logs Table
-- Purpose: Add partner_phone, customer_phone, and virtual_number fields
-- Date: 2025-01-27

-- Add missing fields to call_logs table
ALTER TABLE call_logs 
ADD COLUMN IF NOT EXISTS partner_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS virtual_number VARCHAR(20);

-- Add indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_call_logs_partner_phone ON call_logs(partner_phone);
CREATE INDEX IF NOT EXISTS idx_call_logs_customer_phone ON call_logs(customer_phone);
CREATE INDEX IF NOT EXISTS idx_call_logs_virtual_number ON call_logs(virtual_number);

-- Drop and recreate the active_calls view to include new fields
DROP VIEW IF EXISTS active_calls;
CREATE VIEW active_calls AS
SELECT 
    cl.id,
    cl.call_id,
    cl.uuid,
    cl.caller_number,
    cl.called_number,
    cl.partner_phone,
    cl.customer_phone,
    cl.virtual_number,
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

-- Drop and recreate the get_partner_call_logs function to include new fields
DROP FUNCTION IF EXISTS get_partner_call_logs(INTEGER, INTEGER, INTEGER);
CREATE FUNCTION get_partner_call_logs(
    p_partner_id INTEGER,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    call_id VARCHAR(100),
    caller_number VARCHAR(20),
    called_number VARCHAR(20),
    partner_phone VARCHAR(20),
    customer_phone VARCHAR(20),
    virtual_number VARCHAR(20),
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
        cl.partner_phone,
        cl.customer_phone,
        cl.virtual_number,
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

-- Grant permissions for the updated function
GRANT EXECUTE ON FUNCTION get_partner_call_logs TO authenticated;