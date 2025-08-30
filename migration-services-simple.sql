-- Migration: Create Services Management System (Simplified - No Categories, Base Price, Commission)
-- This migration creates ONLY the core services and partner_services tables
-- Minimal approach to avoid ANY potential issues

-- Step 1: Create services table (minimal)
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create partner_services table (minimal)
CREATE TABLE IF NOT EXISTS partner_services (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Insert sample services data (simple insert)
INSERT INTO services (name, description, is_active) VALUES
('AC Service & Repair', 'Professional air conditioning service, repair, and maintenance', true),
('Electrical Services', 'Complete electrical installation, repair, and maintenance services', true),
('Plumbing Services', 'Professional plumbing repair, installation, and emergency services', true),
('Cleaning Services', 'Residential and commercial cleaning services', true),
('Carpentry Services', 'Custom woodwork, furniture repair, and installation', true),
('Landscaping Services', 'Garden design, maintenance, and landscaping solutions', true),
('Security Services', 'Security system installation and monitoring services', true),
('IT Services', 'Computer repair, network setup, and IT support', true),
('Painting Services', 'Interior and exterior painting services', true),
('Moving Services', 'Professional moving and packing services', true);

-- Step 4: Grant permissions
GRANT ALL ON services TO authenticated;
GRANT ALL ON partner_services TO authenticated;
GRANT USAGE ON SEQUENCE services_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE partner_services_id_seq TO authenticated;

-- Step 5: Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_services ENABLE ROW LEVEL SECURITY;

-- Step 6: Create basic RLS policies
CREATE POLICY "Services are viewable by authenticated users" ON services
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Services can be created by authenticated users" ON services
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Services can be updated by authenticated users" ON services
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Services can be deleted by authenticated users" ON services
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Partner services are viewable by authenticated users" ON partner_services
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Partner services can be created by authenticated users" ON partner_services
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Partner services can be updated by authenticated users" ON partner_services
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Partner services can be deleted by authenticated users" ON partner_services
    FOR DELETE USING (auth.role() = 'authenticated');

-- Step 7: Verify the migration
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as services_count FROM services;
SELECT COUNT(*) as partner_services_count FROM partner_services;
