-- Migration: Create Call Logs Views and Functions
-- Description: Creates views and functions for call_logs table
-- Date: 2025-01-27
-- Author: System Migration

-- Create view for active calls
CREATE OR REPLACE VIEW public.active_calls AS
SELECT 
    cl.id,
    cl.call_id,
    cl.uuid,
    cl.caller_number,
    cl.called_number,
    cl.partner_id,
    cl.partner_phone,
    cl.customer_phone,
    cl.order_id,
    cl.call_type,
    cl.status,
    cl.virtual_number,
    cl.start_time,
    cl.end_time,
    cl.duration,
    cl.call_quality,
    cl.notes,
    cl.transfer_type,
    cl.transfer_destination,
    cl.failover_used,
    cl.metadata,
    cl.created_at,
    cl.updated_at,
    p.name as partner_name,
    p.mobile as partner_mobile,
    o.order_number,
    o.mobile_number as customer_mobile,
    o.customer_name
FROM public.call_logs cl
LEFT JOIN public.partners p ON cl.partner_id = p.id
LEFT JOIN public.orders o ON cl.order_id = o.id
WHERE cl.status IN ('initiated', 'ringing', 'connected')
ORDER BY cl.start_time DESC;

-- Create function to get partner call logs
CREATE OR REPLACE FUNCTION get_partner_call_logs(partner_id_param INTEGER)
RETURNS TABLE (
    id UUID,
    call_id VARCHAR(50),
    uuid VARCHAR(50),
    caller_number VARCHAR(20),
    called_number VARCHAR(20),
    partner_phone VARCHAR(20),
    customer_phone VARCHAR(20),
    order_id UUID,
    call_type VARCHAR(30),
    status VARCHAR(20),
    virtual_number VARCHAR(20),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    call_quality VARCHAR(20),
    notes TEXT,
    transfer_type VARCHAR(30),
    transfer_destination VARCHAR(20),
    failover_used BOOLEAN,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    order_number VARCHAR(50),
    customer_name VARCHAR(255),
    customer_mobile VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.id,
        cl.call_id,
        cl.uuid,
        cl.caller_number,
        cl.called_number,
        cl.partner_phone,
        cl.customer_phone,
        cl.order_id,
        cl.call_type,
        cl.status,
        cl.virtual_number,
        cl.start_time,
        cl.end_time,
        cl.duration,
        cl.call_quality,
        cl.notes,
        cl.transfer_type,
        cl.transfer_destination,
        cl.failover_used,
        cl.metadata,
        cl.created_at,
        cl.updated_at,
        o.order_number,
        o.customer_name,
        o.mobile_number as customer_mobile
    FROM public.call_logs cl
    LEFT JOIN public.orders o ON cl.order_id = o.id
    WHERE cl.partner_id = partner_id_param
    ORDER BY cl.start_time DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON public.active_calls TO authenticated;
GRANT EXECUTE ON FUNCTION get_partner_call_logs(INTEGER) TO authenticated;
