-- 🚀 Migration: Create Services Management System
-- 📅 Date: 2024-12-19
-- 🎯 Purpose: Add comprehensive services management to support the Services Details page

-- =====================================================
-- STEP 1: Create Service Categories Table
-- =====================================================

CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'wrench-screwdriver',
    color VARCHAR(7) DEFAULT '#3B82F6', -- hex color
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Create Services Table
-- =====================================================

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
    
    -- Service Configuration
    base_price DECIMAL(10,2) DEFAULT 0.00,
    commission_percentage DECIMAL(5,2) DEFAULT 0.00,
    min_price DECIMAL(10,2) DEFAULT 0.00,
    max_price DECIMAL(10,2) DEFAULT 9999.99,
    
    -- Service Status & Metrics
    is_active BOOLEAN DEFAULT TRUE,
    total_providers INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Service Details
    estimated_duration_hours INTEGER DEFAULT 1,
    requires_quote BOOLEAN DEFAULT FALSE,
    is_emergency_service BOOLEAN DEFAULT FALSE,
    service_area_km INTEGER DEFAULT 50,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: Create Partner Services Junction Table
-- =====================================================

CREATE TABLE IF NOT EXISTS partner_services (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    
    -- Partner-specific service configuration
    custom_price DECIMAL(10,2),
    custom_commission DECIMAL(5,2),
    is_available BOOLEAN DEFAULT TRUE,
    availability_schedule JSONB, -- Store availability as JSON
    
    -- Partner service metrics
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    
    -- Service area for this partner
    service_radius_km INTEGER DEFAULT 50,
    preferred_areas TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique partner-service combinations
    UNIQUE(partner_id, service_id)
);

-- =====================================================
-- STEP 4: Create Service Orders Table (for tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS service_orders (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    partner_id INTEGER REFERENCES partners(id) ON DELETE SET NULL,
    
    -- Order details
    customer_name VARCHAR(200),
    customer_mobile VARCHAR(20),
    customer_address TEXT,
    customer_city VARCHAR(100),
    
    -- Service details
    service_date DATE,
    time_slot VARCHAR(100),
    service_notes TEXT,
    
    -- Financial details
    quoted_price DECIMAL(10,2),
    final_price DECIMAL(10,2),
    commission_amount DECIMAL(10,2),
    partner_earnings DECIMAL(10,2),
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded')),
    assigned_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Customer feedback
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_review TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 5: Create Indexes for Performance
-- =====================================================

-- Service categories indexes
CREATE INDEX idx_service_categories_active ON service_categories(is_active);
CREATE INDEX idx_service_categories_sort ON service_categories(sort_order);

-- Services indexes
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_price ON services(base_price);
CREATE INDEX idx_services_rating ON services(average_rating);

-- Partner services indexes
CREATE INDEX idx_partner_services_partner ON partner_services(partner_id);
CREATE INDEX idx_partner_services_service ON partner_services(service_id);
CREATE INDEX idx_partner_services_available ON partner_services(is_available);

-- Service orders indexes
CREATE INDEX idx_service_orders_service ON service_orders(service_id);
CREATE INDEX idx_service_orders_partner ON service_orders(partner_id);
CREATE INDEX idx_service_orders_status ON service_orders(status);
CREATE INDEX idx_service_orders_date ON service_orders(service_date);

-- =====================================================
-- STEP 6: Create Triggers for Updated Timestamps
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_services_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_service_categories_updated_at 
    BEFORE UPDATE ON service_categories 
    FOR EACH ROW EXECUTE FUNCTION update_services_updated_at_column();

CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW EXECUTE FUNCTION update_services_updated_at_column();

CREATE TRIGGER update_partner_services_updated_at 
    BEFORE UPDATE ON partner_services 
    FOR EACH ROW EXECUTE FUNCTION update_services_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at 
    BEFORE UPDATE ON service_orders 
    FOR EACH ROW EXECUTE FUNCTION update_services_updated_at_column();

-- =====================================================
-- STEP 7: Insert Sample Data
-- =====================================================

-- Insert service categories
INSERT INTO service_categories (name, description, icon, color, sort_order) VALUES
('HVAC', 'Heating, Ventilation, and Air Conditioning services', 'snowflake', '#3B82F6', 1),
('Electrical', 'Electrical installation, repair, and maintenance', 'bolt', '#10B981', 2),
('Plumbing', 'Plumbing repair, installation, and emergency services', 'droplet', '#06B6D4', 3),
('Cleaning', 'Residential and commercial cleaning services', 'sparkles', '#8B5CF6', 4),
('Carpentry', 'Custom woodwork, furniture repair, and installation', 'wrench-screwdriver', '#F59E0B', 5),
('Landscaping', 'Garden design, maintenance, and outdoor services', 'leaf', '#84CC16', 6),
('Security', 'Security systems, CCTV, and monitoring services', 'shield-check', '#EF4444', 7),
('IT Services', 'Computer repair, networking, and technical support', 'computer-desktop', '#6366F1', 8),
('Painting', 'Interior and exterior painting services', 'paint-brush', '#EC4899', 9),
('Other', 'Miscellaneous and specialized services', 'ellipsis-horizontal', '#6B7280', 10)
ON CONFLICT (name) DO NOTHING;

-- Insert sample services
INSERT INTO services (name, description, category_id, base_price, commission_percentage, total_providers, total_orders, average_rating) VALUES
('AC Service & Repair', 'Professional air conditioning service, repair, and maintenance', 1, 500.00, 15.00, 45, 1200, 4.6),
('Electrical Installation', 'Complete electrical installation and wiring services', 2, 300.00, 12.00, 38, 890, 4.4),
('Plumbing Repair', 'Professional plumbing repair and emergency services', 3, 400.00, 14.00, 52, 1560, 4.7),
('Deep Cleaning', 'Residential and commercial deep cleaning services', 4, 200.00, 10.00, 67, 2100, 4.3),
('Custom Carpentry', 'Custom woodwork and furniture installation', 5, 600.00, 18.00, 23, 340, 4.5),
('Garden Maintenance', 'Regular garden care and landscaping services', 6, 150.00, 12.00, 34, 780, 4.2),
('CCTV Installation', 'Security camera installation and setup', 7, 800.00, 20.00, 28, 450, 4.8),
('Computer Repair', 'PC and laptop repair services', 8, 250.00, 15.00, 41, 920, 4.1),
('Interior Painting', 'Professional interior painting services', 9, 350.00, 16.00, 39, 650, 4.4)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 8: Create Views for Analytics
-- =====================================================

-- View for service statistics
CREATE OR REPLACE VIEW service_stats AS
SELECT 
    s.id,
    s.name,
    sc.name as category,
    s.base_price,
    s.commission_percentage,
    s.is_active,
    s.total_providers,
    s.total_orders,
    s.average_rating,
    COUNT(ps.partner_id) as active_partners,
    COALESCE(SUM(ps.total_revenue), 0) as total_revenue
FROM services s
LEFT JOIN service_categories sc ON s.category_id = sc.id
LEFT JOIN partner_services ps ON s.id = ps.service_id AND ps.is_available = true
GROUP BY s.id, s.name, sc.name, s.base_price, s.commission_percentage, s.is_active, s.total_providers, s.total_orders, s.average_rating;

-- View for partner service overview
CREATE OR REPLACE VIEW partner_service_overview AS
SELECT 
    p.id as partner_id,
    p.name as partner_name,
    p.service_type,
    p.status as partner_status,
    COUNT(ps.service_id) as total_services,
    COUNT(ps.service_id) FILTER (WHERE ps.is_available = true) as available_services,
    AVG(ps.rating) as average_service_rating,
    SUM(ps.total_orders) as total_service_orders,
    SUM(ps.total_revenue) as total_service_revenue
FROM partners p
LEFT JOIN partner_services ps ON p.id = ps.partner_id
GROUP BY p.id, p.name, p.service_type, p.status;

-- =====================================================
-- STEP 9: Grant Permissions
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON service_categories TO authenticated;
GRANT ALL ON services TO authenticated;
GRANT ALL ON partner_services TO authenticated;
GRANT ALL ON service_orders TO authenticated;
GRANT ALL ON service_stats TO authenticated;
GRANT ALL ON partner_service_overview TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE service_categories_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE services_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE partner_services_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE service_orders_id_seq TO authenticated;

-- =====================================================
-- STEP 10: Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - allow all for now)
CREATE POLICY "Allow all operations for authenticated users" ON service_categories FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON services FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON partner_services FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON service_orders FOR ALL USING (true);

-- =====================================================
-- STEP 11: Verification Queries
-- =====================================================

-- Verify tables were created
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_name IN ('service_categories', 'services', 'partner_services', 'service_orders')
ORDER BY table_name;

-- Verify sample data was inserted
SELECT 'service_categories' as table_name, COUNT(*) as record_count FROM service_categories
UNION ALL
SELECT 'services' as table_name, COUNT(*) as record_count FROM services;

-- Verify views were created
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_name IN ('service_stats', 'partner_service_overview')
ORDER BY table_name;

-- =====================================================
-- 🎉 Migration Complete!
-- =====================================================

-- Next steps:
-- 1. Update the Services Details page to use real data
-- 2. Create API endpoints for services management
-- 3. Update partner management to link with services
-- 4. Test the complete system
