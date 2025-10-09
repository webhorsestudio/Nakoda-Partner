-- Migration: Create Call Logs Table for Acefone Call Masking
-- Description: Creates call_logs table to track all masked calls between partners and customers
-- Date: 2025-01-27
-- Author: System Migration

-- Create call_logs table
CREATE TABLE IF NOT EXISTS public.call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id VARCHAR(50) NOT NULL UNIQUE,
    uuid VARCHAR(50) UNIQUE,
    
    -- Caller and Called Information
    caller_number VARCHAR(20),
    called_number VARCHAR(20),
    
    -- Partner and Customer Information
    partner_id INTEGER REFERENCES public.partners(id) ON DELETE SET NULL,
    partner_phone VARCHAR(20),
    customer_phone VARCHAR(20),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    
    -- Call Details
    call_type VARCHAR(30) NOT NULL DEFAULT 'partner_to_customer',
    status VARCHAR(20) NOT NULL DEFAULT 'initiated',
    virtual_number VARCHAR(20), -- DID number
    
    -- Timing Information
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- Duration in seconds
    
    -- Call Quality and Notes
    call_quality VARCHAR(20) DEFAULT 'unknown',
    notes TEXT,
    
    -- Transfer Information
    transfer_type VARCHAR(30),
    transfer_destination VARCHAR(20),
    failover_used BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_call_logs_call_id ON public.call_logs(call_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_uuid ON public.call_logs(uuid);
CREATE INDEX IF NOT EXISTS idx_call_logs_partner_id ON public.call_logs(partner_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_order_id ON public.call_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_caller_number ON public.call_logs(caller_number);
CREATE INDEX IF NOT EXISTS idx_call_logs_called_number ON public.call_logs(called_number);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON public.call_logs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_start_time ON public.call_logs(start_time);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_type ON public.call_logs(call_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_call_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_call_logs_updated_at
    BEFORE UPDATE ON public.call_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_call_logs_updated_at();

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
    order_id VARCHAR(50),
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

-- Enable RLS (Row Level Security)
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Partners can view their own call logs" ON public.call_logs
    FOR SELECT USING (
        partner_id IN (
            SELECT id FROM public.partners 
            WHERE id = auth.uid()::INTEGER
        )
    );

CREATE POLICY "Admins can view all call logs" ON public.call_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.call_logs TO authenticated;
GRANT SELECT ON public.active_calls TO authenticated;
GRANT EXECUTE ON FUNCTION get_partner_call_logs(INTEGER) TO authenticated;

-- Insert sample data for testing (optional)
-- INSERT INTO public.call_logs (call_id, caller_number, called_number, call_type, status, virtual_number)
-- VALUES ('test_call_001', '9326499348', '8065343250', 'partner_to_customer', 'initiated', '8065343250');

-- Verify table creation
SELECT 
    'call_logs table created successfully' as status,
    COUNT(*) as total_records
FROM public.call_logs;

-- Table structure created successfully
