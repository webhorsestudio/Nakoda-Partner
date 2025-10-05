-- Migration: Optimize Admin Orders Performance
-- Purpose: Add composite indexes and optimize queries for admin real-time orders
-- Date: 2025-01-20

-- =====================================================
-- STEP 1: Add Composite Indexes for Admin Queries
-- =====================================================

-- Index for admin real-time orders query (created_at DESC with pagination)
CREATE INDEX IF NOT EXISTS idx_orders_admin_realtime 
ON orders(created_at DESC, status, partner_id);

-- Index for admin search queries (customer_name, order_number, service_type)
CREATE INDEX IF NOT EXISTS idx_orders_admin_search 
ON orders(customer_name, order_number, service_type);

-- Index for status-based filtering with pagination
CREATE INDEX IF NOT EXISTS idx_orders_status_created 
ON orders(status, created_at DESC);

-- Index for partner assignment queries
CREATE INDEX IF NOT EXISTS idx_orders_partner_status 
ON orders(partner_id, status, created_at DESC);

-- =====================================================
-- STEP 2: Optimize Existing Indexes
-- =====================================================

-- Ensure created_at index is optimized for DESC queries
DROP INDEX IF EXISTS idx_orders_date_created;
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc 
ON orders(created_at DESC);

-- Add partial index for active orders (not completed/cancelled)
CREATE INDEX IF NOT EXISTS idx_orders_active_status 
ON orders(created_at DESC) 
WHERE status NOT IN ('completed', 'cancelled');

-- =====================================================
-- STEP 3: Add Statistics and Analyze
-- =====================================================

-- Update table statistics for better query planning
ANALYZE orders;

-- =====================================================
-- STEP 4: Create Optimized Views for Admin Dashboard
-- =====================================================

-- View for admin dashboard stats (lightweight)
CREATE OR REPLACE VIEW admin_orders_stats AS
SELECT 
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
    COUNT(*) FILTER (WHERE status = 'assigned') as assigned_orders,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
    COUNT(*) FILTER (WHERE partner_id IS NULL) as unassigned_orders,
    COUNT(*) FILTER (WHERE partner_id IS NOT NULL) as assigned_to_partner,
    MAX(created_at) as latest_order_date,
    MIN(created_at) as earliest_order_date
FROM orders;

-- View for admin orders list (optimized columns only)
CREATE OR REPLACE VIEW admin_orders_list AS
SELECT 
    id,
    bitrix24_id,
    title,
    status,
    amount,
    currency,
    customer_name,
    city,
    pin_code,
    advance_amount,
    service_date,
    time_slot,
    date_created,
    created_at,
    order_number,
    mobile_number,
    partner_id,
    service_type
FROM orders
ORDER BY created_at DESC;

-- Grant permissions
GRANT SELECT ON admin_orders_stats TO authenticated;
GRANT SELECT ON admin_orders_list TO authenticated;

-- =====================================================
-- STEP 5: Create Performance Monitoring Function
-- =====================================================

CREATE OR REPLACE FUNCTION get_admin_orders_performance()
RETURNS TABLE (
    index_name TEXT,
    index_size TEXT,
    index_usage_count BIGINT,
    last_used TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||indexname as index_name,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
        idx_tup_read as index_usage_count,
        last_used
    FROM pg_stat_user_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_orders%'
    ORDER BY idx_tup_read DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 6: Add Query Optimization Hints
-- =====================================================

-- Set work_mem for better sorting performance (session-level)
-- This should be set at the database level, not in migration
-- ALTER SYSTEM SET work_mem = '64MB';
-- ALTER SYSTEM SET shared_buffers = '256MB';

-- =====================================================
-- STEP 7: Create Index Maintenance Function
-- =====================================================

CREATE OR REPLACE FUNCTION maintain_orders_indexes()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
BEGIN
    -- Reindex orders table indexes
    REINDEX TABLE orders;
    
    -- Update statistics
    ANALYZE orders;
    
    result := 'Orders indexes maintained successfully at ' || NOW();
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 8: Add Comments for Documentation
-- =====================================================

COMMENT ON INDEX idx_orders_admin_realtime IS 'Composite index for admin real-time orders query (created_at DESC, status, partner_id)';
COMMENT ON INDEX idx_orders_admin_search IS 'Composite index for admin search functionality (customer_name, order_number, service_type)';
COMMENT ON INDEX idx_orders_status_created IS 'Composite index for status-based filtering with pagination';
COMMENT ON INDEX idx_orders_partner_status IS 'Composite index for partner assignment queries';
COMMENT ON INDEX idx_orders_active_status IS 'Partial index for active orders (excludes completed/cancelled)';

COMMENT ON VIEW admin_orders_stats IS 'Lightweight view for admin dashboard statistics';
COMMENT ON VIEW admin_orders_list IS 'Optimized view for admin orders list with essential columns only';

COMMENT ON FUNCTION get_admin_orders_performance() IS 'Function to monitor admin orders index performance';
COMMENT ON FUNCTION maintain_orders_indexes() IS 'Function to maintain and optimize orders table indexes';

-- =====================================================
-- STEP 9: Create Performance Monitoring Query
-- =====================================================

-- Query to check index usage (run this to monitor performance)
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
AND tablename = 'orders'
ORDER BY idx_scan DESC;
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration: Optimize Admin Orders Performance - COMPLETED';
    RAISE NOTICE 'Added composite indexes for better query performance';
    RAISE NOTICE 'Created optimized views for admin dashboard';
    RAISE NOTICE 'Added performance monitoring functions';
    RAISE NOTICE 'Run ANALYZE orders; to update statistics';
END $$;
