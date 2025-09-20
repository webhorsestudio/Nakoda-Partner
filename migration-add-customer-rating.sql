-- Migration: Add Customer Rating Field to Orders Table
-- Purpose: Add customer rating field to store partner's rating of the customer
-- Date: 2025-01-17

-- =====================================================
-- STEP 1: Add Customer Rating Field to Orders Table
-- =====================================================

-- Add customer rating field (1-5 stars)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_rating INTEGER 
    CHECK (customer_rating >= 1 AND customer_rating <= 5);

-- Add comment for the field
COMMENT ON COLUMN orders.customer_rating IS 'Partner rating of the customer (1-5 stars)';

-- =====================================================
-- STEP 2: Create Index for Performance
-- =====================================================

-- Index for customer rating queries
CREATE INDEX IF NOT EXISTS idx_orders_customer_rating ON orders(customer_rating);

-- Index for partner_id + customer_rating (common query pattern)
CREATE INDEX IF NOT EXISTS idx_orders_partner_customer_rating ON orders(partner_id, customer_rating);

-- =====================================================
-- STEP 3: Create View for Customer Ratings
-- =====================================================

CREATE OR REPLACE VIEW customer_ratings AS
SELECT 
    o.id,
    o.bitrix24_id,
    o.title,
    o.customer_name,
    o.customer_rating,
    o.completed_at,
    o.partner_id,
    p.name as partner_name,
    o.created_at,
    o.updated_at
FROM orders o
LEFT JOIN partners p ON o.partner_id = p.id
WHERE o.customer_rating IS NOT NULL
ORDER BY o.completed_at DESC;

-- Grant access to the view
GRANT SELECT ON customer_ratings TO authenticated;

-- =====================================================
-- STEP 4: Create Function to Get Average Customer Rating
-- =====================================================

CREATE OR REPLACE FUNCTION get_average_customer_rating()
RETURNS DECIMAL(3,2) AS $$
BEGIN
    RETURN (
        SELECT ROUND(AVG(customer_rating)::DECIMAL, 2)
        FROM orders 
        WHERE customer_rating IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 5: Create Function to Get Customer Rating Stats
-- =====================================================

CREATE OR REPLACE FUNCTION get_customer_rating_stats()
RETURNS TABLE(
    total_ratings BIGINT,
    average_rating DECIMAL(3,2),
    five_star_count BIGINT,
    four_star_count BIGINT,
    three_star_count BIGINT,
    two_star_count BIGINT,
    one_star_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_ratings,
        ROUND(AVG(customer_rating)::DECIMAL, 2) as average_rating,
        COUNT(CASE WHEN customer_rating = 5 THEN 1 END) as five_star_count,
        COUNT(CASE WHEN customer_rating = 4 THEN 1 END) as four_star_count,
        COUNT(CASE WHEN customer_rating = 3 THEN 1 END) as three_star_count,
        COUNT(CASE WHEN customer_rating = 2 THEN 1 END) as two_star_count,
        COUNT(CASE WHEN customer_rating = 1 THEN 1 END) as one_star_count
    FROM orders 
    WHERE customer_rating IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- ✅ Added customer_rating field to orders table
-- ✅ Created indexes for performance
-- ✅ Created view for customer ratings
-- ✅ Created helper functions for rating statistics
-- ✅ Added proper constraints and validation
