-- Drop existing table and related objects if they exist
DROP TABLE IF EXISTS partners CASCADE;
DROP VIEW IF EXISTS partner_stats CASCADE;
DROP FUNCTION IF EXISTS update_partners_updated_at_column() CASCADE;

-- Create partners table for partner management
CREATE TABLE partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Active', 'Pending', 'Suspended')),
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0.00 AND rating <= 5.00),
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0.00,
  location VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  pin_code VARCHAR(10),
  mobile VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  commission_percentage DECIMAL(5,2) DEFAULT 0.00,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE,
  verification_status VARCHAR(20) DEFAULT 'Pending' CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')),
  documents_verified BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_service_type ON partners(service_type);
CREATE INDEX idx_partners_location ON partners(location);
CREATE INDEX idx_partners_verification_status ON partners(verification_status);
CREATE INDEX idx_partners_joined_date ON partners(joined_date);

-- Add RLS (Row Level Security) policies
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (you can restrict this further if needed)
CREATE POLICY "Allow all operations for authenticated users" ON partners
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_partners_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_partners_updated_at 
    BEFORE UPDATE ON partners 
    FOR EACH ROW 
    EXECUTE FUNCTION update_partners_updated_at_column();

-- Insert sample data for testing
INSERT INTO partners (name, service_type, status, rating, total_orders, total_revenue, location, city, state, mobile, email, commission_percentage, verification_status, documents_verified) VALUES
('Elite Electrical Services', 'Electrical', 'Active', 4.9, 45, 5850.00, 'New York, NY', 'New York', 'NY', '+1-555-0101', 'elite@electrical.com', 15.00, 'Verified', true),
('CleanPro Housekeeping', 'Cleaning', 'Active', 4.8, 38, 3420.00, 'Los Angeles, CA', 'Los Angeles', 'CA', '+1-555-0102', 'clean@pro.com', 12.00, 'Verified', true),
('PlumbRight Solutions', 'Plumbing', 'Active', 4.7, 32, 4800.00, 'Chicago, IL', 'Chicago', 'IL', '+1-555-0103', 'plumb@right.com', 18.00, 'Verified', true),
('CoolBreeze HVAC', 'HVAC', 'Pending', 4.6, 28, 3920.00, 'Miami, FL', 'Miami', 'FL', '+1-555-0104', 'cool@breeze.com', 14.00, 'Pending', false),
('GreenThumb Landscaping', 'Landscaping', 'Active', 4.5, 22, 2640.00, 'Seattle, WA', 'Seattle', 'WA', '+1-555-0105', 'green@thumb.com', 16.00, 'Verified', true),
('QuickFix Carpentry', 'Carpentry', 'Suspended', 4.3, 15, 1800.00, 'Austin, TX', 'Austin', 'TX', '+1-555-0106', 'quick@fix.com', 13.00, 'Verified', true),
('SafeGuard Security', 'Security', 'Active', 4.8, 41, 6150.00, 'Denver, CO', 'Denver', 'CO', '+1-555-0107', 'safe@guard.com', 17.00, 'Verified', true),
('TechSmart IT', 'IT Services', 'Pending', 4.4, 19, 2850.00, 'Portland, OR', 'Portland', 'OR', '+1-555-0108', 'tech@smart.com', 20.00, 'Pending', false);

-- Create a view for partner statistics
CREATE VIEW partner_stats AS
SELECT 
  COUNT(*) as total_partners,
  COUNT(*) FILTER (WHERE status = 'Active') as active_partners,
  COUNT(*) FILTER (WHERE status = 'Pending') as pending_partners,
  COUNT(*) FILTER (WHERE status = 'Suspended') as suspended_partners,
  COUNT(*) FILTER (WHERE verification_status = 'Verified') as verified_partners,
  ROUND(AVG(rating), 2) as average_rating,
  SUM(total_orders) as total_orders,
  SUM(total_revenue) as total_revenue,
  ROUND(AVG(commission_percentage), 2) as average_commission
FROM partners;

-- Grant permissions
GRANT ALL ON partners TO authenticated;
GRANT ALL ON partner_stats TO authenticated;
GRANT USAGE ON SEQUENCE partners_id_seq TO authenticated;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'partners' 
ORDER BY ordinal_position;
