-- Migration: Add partner_id column to orders table
-- This migration adds a foreign key relationship between orders and partners

-- First, fix the existing trigger function that has an error
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add partner_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS partner_id INTEGER;

-- Add foreign key constraint to link orders to partners
ALTER TABLE orders ADD CONSTRAINT fk_orders_partner_id 
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);

-- Update existing orders to link them to partners based on the partner name field
-- This is a one-time data migration
UPDATE orders 
SET partner_id = p.id 
FROM partners p 
WHERE orders.partner = p.name 
AND orders.partner_id IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN orders.partner_id IS 'Foreign key reference to partners table';
