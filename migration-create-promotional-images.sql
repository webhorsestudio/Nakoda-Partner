-- Migration: Create Promotional Images Management System
-- Date: 2024-12-19
-- Purpose: Add promotional image slider management for partner dashboard

-- =====================================================
-- STEP 1: Create Promotional Images Table
-- =====================================================

CREATE TABLE IF NOT EXISTS promotional_images (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(300),
    button_text VARCHAR(50) DEFAULT 'Learn More',
    brand_name VARCHAR(100) DEFAULT 'Nakoda Partner',
    
    -- Image Configuration
    image_url TEXT NOT NULL,
    image_alt VARCHAR(200),
    gradient_from VARCHAR(20) DEFAULT 'blue-600',
    gradient_to VARCHAR(20) DEFAULT 'indigo-600',
    
    -- Display Settings
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    auto_rotate_duration INTEGER DEFAULT 5000, -- milliseconds
    
    -- Action Configuration
    action_type VARCHAR(20) DEFAULT 'button', -- 'button', 'link', 'none'
    action_url TEXT,
    action_target VARCHAR(10) DEFAULT '_self', -- '_self', '_blank'
    
    -- Targeting & Analytics
    target_audience VARCHAR(50) DEFAULT 'all', -- 'all', 'new', 'active', 'inactive'
    click_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by INTEGER, -- Will be set when admin creates images
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NULL
);

-- =====================================================
-- STEP 2: Create Indexes for Performance
-- =====================================================

CREATE INDEX idx_promotional_images_active ON promotional_images(is_active);
CREATE INDEX idx_promotional_images_display_order ON promotional_images(display_order);
CREATE INDEX idx_promotional_images_target_audience ON promotional_images(target_audience);
CREATE INDEX idx_promotional_images_created_at ON promotional_images(created_at);
CREATE INDEX idx_promotional_images_expires_at ON promotional_images(expires_at);

-- =====================================================
-- STEP 3: Create Function to Update Updated At
-- =====================================================

CREATE OR REPLACE FUNCTION update_promotional_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 4: Create Trigger for Updated At
-- =====================================================

CREATE TRIGGER trigger_update_promotional_images_updated_at
    BEFORE UPDATE ON promotional_images
    FOR EACH ROW
    EXECUTE FUNCTION update_promotional_images_updated_at();

-- =====================================================
-- STEP 5: Insert Sample Data
-- =====================================================

INSERT INTO promotional_images (
    title, 
    subtitle, 
    button_text, 
    brand_name, 
    image_url, 
    image_alt, 
    gradient_from, 
    gradient_to, 
    display_order, 
    is_active,
    target_audience
) VALUES 
(
    'Earn More with Every Job',
    'Complete tasks and boost your income',
    'View Jobs',
    'Nakoda Partner',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop&crop=center',
    'Professional worker completing tasks',
    'blue-600',
    'indigo-600',
    1,
    TRUE,
    'all'
),
(
    'Flexible Working Hours',
    'Work when it suits you best',
    'Get Started',
    'Nakoda Partner',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&crop=center',
    'Flexible work schedule concept',
    'green-600',
    'emerald-600',
    2,
    TRUE,
    'all'
),
(
    'Professional Support',
    '24/7 assistance for all partners',
    'Learn More',
    'Nakoda Partner',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&crop=center',
    'Customer support team',
    'purple-600',
    'violet-600',
    3,
    TRUE,
    'all'
);

-- =====================================================
-- STEP 6: Grant Permissions
-- =====================================================

GRANT ALL ON promotional_images TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE promotional_images_id_seq TO authenticated;

-- =====================================================
-- STEP 7: Create View for Active Images
-- =====================================================

CREATE OR REPLACE VIEW active_promotional_images AS
SELECT 
    id,
    title,
    subtitle,
    button_text,
    brand_name,
    image_url,
    image_alt,
    gradient_from,
    gradient_to,
    display_order,
    auto_rotate_duration,
    action_type,
    action_url,
    action_target,
    target_audience,
    click_count,
    view_count,
    created_at,
    expires_at
FROM promotional_images
WHERE is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY display_order ASC, created_at ASC;

-- Grant permissions on view
GRANT SELECT ON active_promotional_images TO authenticated;

-- =====================================================
-- STEP 8: Create Analytics Table
-- =====================================================

CREATE TABLE IF NOT EXISTS promotional_image_analytics (
    id SERIAL PRIMARY KEY,
    image_id INTEGER NOT NULL REFERENCES promotional_images(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL, -- 'view', 'click', 'impression'
    partner_id INTEGER REFERENCES partners(id),
    session_id VARCHAR(100),
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analytics
CREATE INDEX idx_promotional_analytics_image_id ON promotional_image_analytics(image_id);
CREATE INDEX idx_promotional_analytics_event_type ON promotional_image_analytics(event_type);
CREATE INDEX idx_promotional_analytics_created_at ON promotional_image_analytics(created_at);
CREATE INDEX idx_promotional_analytics_partner_id ON promotional_image_analytics(partner_id);

-- Grant permissions
GRANT ALL ON promotional_image_analytics TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE promotional_image_analytics_id_seq TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary:
-- ✅ Created promotional_images table with full configuration
-- ✅ Added proper indexes for performance
-- ✅ Created triggers for automatic timestamp updates
-- ✅ Inserted sample promotional images
-- ✅ Created view for active images only
-- ✅ Added analytics tracking table
-- ✅ Granted proper permissions
