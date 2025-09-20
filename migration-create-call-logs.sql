-- Create call logs table for masked calling system
CREATE TABLE IF NOT EXISTS call_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id VARCHAR(100) UNIQUE NOT NULL,
    partner_phone VARCHAR(20) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    virtual_number VARCHAR(20) NOT NULL,
    order_id UUID REFERENCES orders(id),
    partner_id INTEGER REFERENCES partners(id), -- Changed from UUID to INTEGER
    customer_id VARCHAR(100),
    call_type VARCHAR(50) NOT NULL DEFAULT 'partner_to_customer',
    status VARCHAR(20) NOT NULL DEFAULT 'initiated',
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- Duration in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_call_logs_order_id ON call_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_partner_id ON call_logs(partner_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_id ON call_logs(call_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_start_time ON call_logs(start_time);

-- Add call logs to partners table if not exists
DO $$ 
BEGIN
    -- Add partner phone number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'phone_number') THEN
        ALTER TABLE partners ADD COLUMN phone_number VARCHAR(20);
    END IF;
END $$;
