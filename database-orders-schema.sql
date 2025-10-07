-- Drop existing table if it exists (be careful with this in production!)
-- DROP TABLE IF EXISTS orders CASCADE;

-- Create orders table to store Bitrix24 deals with parsed fields
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bitrix24_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    
    -- Parsed fields from title
    mode VARCHAR(50),
    package VARCHAR(200),
    partner VARCHAR(200), -- New field for partner
    order_number VARCHAR(50),
    mobile_number VARCHAR(20),
    order_date VARCHAR(100),
    order_time VARCHAR(100),
    customer_name VARCHAR(200),
    address TEXT,
    city VARCHAR(100),
    pin_code VARCHAR(10),
    
    -- New financial and service fields
    commission_percentage VARCHAR(50),
    advance_amount VARCHAR(100),
    taxes_and_fees VARCHAR(100),
    vendor_amount VARCHAR(100), -- Vendor amount (balance amount) from Bitrix24
    service_date VARCHAR(200),
    time_slot VARCHAR(100),
    
    -- Original fields
    service_type VARCHAR(100),
    specification TEXT,
    stage_id VARCHAR(50),
    stage_semantic_id VARCHAR(10),
    status VARCHAR(50) DEFAULT 'pending',
    currency VARCHAR(10) DEFAULT 'INR',
    amount DECIMAL(10,2) DEFAULT 0.00,
    lead_id VARCHAR(50),
    contact_id VARCHAR(50),
    company_id VARCHAR(50),
    assigned_by_id VARCHAR(50),
    created_by_id VARCHAR(50),
    begin_date TIMESTAMP WITH TIME ZONE,
    close_date TIMESTAMP WITH TIME ZONE,
    date_created TIMESTAMP WITH TIME ZONE,
    date_modified TIMESTAMP WITH TIME ZONE,
    is_closed BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT TRUE,
    comments TEXT,
    additional_info TEXT,
    location_id VARCHAR(50),
    category_id VARCHAR(50),
    source_id VARCHAR(50),
    source_description TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    last_activity_time TIMESTAMP WITH TIME ZONE,
    last_activity_by VARCHAR(50),
    last_communication_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns if they don't exist (for existing tables)
DO $$ 
BEGIN
    -- Add mode column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'mode') THEN
        ALTER TABLE orders ADD COLUMN mode VARCHAR(50);
    END IF;
    
    -- Add package column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'package') THEN
        ALTER TABLE orders ADD COLUMN package VARCHAR(200);
    END IF;
    
    -- Add partner column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'partner') THEN
        ALTER TABLE orders ADD COLUMN partner VARCHAR(200);
    END IF;
    
    -- Add order_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_number') THEN
        ALTER TABLE orders ADD COLUMN order_number VARCHAR(50);
    END IF;
    
    -- Add mobile_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'mobile_number') THEN
        ALTER TABLE orders ADD COLUMN mobile_number VARCHAR(20);
    END IF;
    
    -- Add order_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_date') THEN
        ALTER TABLE orders ADD COLUMN order_date VARCHAR(100);
    END IF;
    
    -- Add order_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_time') THEN
        ALTER TABLE orders ADD COLUMN order_time VARCHAR(100);
    END IF;
    
    -- Add customer_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_name') THEN
        ALTER TABLE orders ADD COLUMN customer_name VARCHAR(200);
    END IF;
    
    -- Add address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'address') THEN
        ALTER TABLE orders ADD COLUMN address TEXT;
    END IF;
    
    -- Add city column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'city') THEN
        ALTER TABLE orders ADD COLUMN city VARCHAR(100);
    END IF;
    
    -- Add pin_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'pin_code') THEN
        ALTER TABLE orders ADD COLUMN pin_code VARCHAR(10);
    END IF;
    
    -- Add commission_percentage column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'commission_percentage') THEN
        ALTER TABLE orders ADD COLUMN commission_percentage VARCHAR(50);
    END IF;
    
    -- Add advance_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'advance_amount') THEN
        ALTER TABLE orders ADD COLUMN advance_amount VARCHAR(100);
    END IF;
    
    -- Add taxes_and_fees column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'taxes_and_fees') THEN
        ALTER TABLE orders ADD COLUMN taxes_and_fees VARCHAR(100);
    END IF;
    
    -- Add service_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'service_date') THEN
        ALTER TABLE orders ADD COLUMN service_date VARCHAR(200);
    END IF;
    
    -- Add time_slot column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'time_slot') THEN
        ALTER TABLE orders ADD COLUMN time_slot VARCHAR(100);
    END IF;
    
    -- Add vendor_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'vendor_amount') THEN
        ALTER TABLE orders ADD COLUMN vendor_amount VARCHAR(100);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_bitrix24_id ON orders(bitrix24_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stage_id ON orders(stage_id);
CREATE INDEX IF NOT EXISTS idx_orders_date_created ON orders(date_created);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_by_id ON orders(assigned_by_id);
CREATE INDEX IF NOT EXISTS idx_orders_contact_id ON orders(contact_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_city ON orders(city);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_amount ON orders(vendor_amount);

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO orders (
    bitrix24_id, 
    title, 
    service_type, 
    specification, 
    stage_id, 
    stage_semantic_id, 
    status, 
    amount, 
    lead_id, 
    contact_id, 
    assigned_by_id, 
    created_by_id, 
    begin_date, 
    close_date, 
    date_created, 
    date_modified,
    is_closed,
    is_new
) VALUES 
(
    '464',
    'Service Enquiry:Sanitization',
    'Sanitization',
    'Sanitization 2 BHK',
    'UC_KGG7AX',
    'P',
    'in_progress',
    0.00,
    '364',
    '382',
    '10',
    '1',
    '2022-04-04T03:00:00+03:00'::TIMESTAMP WITH TIME ZONE,
    '2023-08-16T03:00:00+03:00'::TIMESTAMP WITH TIME ZONE,
    '2022-04-04T14:22:36+03:00'::TIMESTAMP WITH TIME ZONE,
    '2023-08-09T13:29:41+03:00'::TIMESTAMP WITH TIME ZONE,
    FALSE,
    FALSE
),
(
    '466',
    'Service Enquiry:Full Home Cleaning',
    'Cleaning',
    'Full Home Deep Cleaning 2 BHK',
    'UC_KGG7AX',
    'P',
    'in_progress',
    0.00,
    '366',
    '384',
    '10',
    '1',
    '2022-04-04T03:00:00+03:00'::TIMESTAMP WITH TIME ZONE,
    '2024-07-04T03:00:00+03:00'::TIMESTAMP WITH TIME ZONE,
    '2022-04-04T14:23:12+03:00'::TIMESTAMP WITH TIME ZONE,
    '2024-06-27T12:30:06+03:00'::TIMESTAMP WITH TIME ZONE,
    FALSE,
    FALSE
),
(
    '468',
    'Service Enquiry:AC Service Repair',
    'AC Service',
    'Split AC Full Service',
    'NEW',
    'P',
    'new',
    0.00,
    '368',
    '386',
    '24',
    '1',
    '2022-04-04T03:00:00+03:00'::TIMESTAMP WITH TIME ZONE,
    NULL,
    '2022-04-04T14:47:13+03:00'::TIMESTAMP WITH TIME ZONE,
    '2022-09-18T16:57:32+03:00'::TIMESTAMP WITH TIME ZONE,
    FALSE,
    FALSE
);
