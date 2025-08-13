-- Post-Migration Code Update Instructions
-- After running the database migration, update your code as follows:

-- =====================================================
-- STEP 1: Update bitrix24Service.ts
-- =====================================================

-- Remove safeTruncate calls for these fields since they now have larger limits:

/*
// BEFORE (with safeTruncate):
service_type: this.safeTruncate(packageName, 100, 'service_type'),
city: this.safeTruncate(city, 100, 'city'),
order_date: this.safeTruncate(orderDate, 100, 'order_date'),
order_time: this.safeTruncate(orderTime, 100, 'order_time'),
utm_source: this.safeTruncate(deal.UTM_SOURCE || undefined, 100, 'utm_source'),
utm_medium: this.safeTruncate(deal.UTM_MEDIUM || undefined, 100, 'utm_medium'),
utm_campaign: this.safeTruncate(deal.UTM_CAMPAIGN || undefined, 100, 'utm_campaign'),
utm_content: this.safeTruncate(deal.UTM_CONTENT || undefined, 100, 'utm_content'),
utm_term: this.safeTruncate(deal.UTM_TERM || undefined, 100, 'utm_term'),

// AFTER (direct assignment):
service_type: packageName,
city: city,
order_date: orderDate,
order_time: orderTime,
utm_source: deal.UTM_SOURCE || undefined,
utm_medium: deal.UTM_MEDIUM || undefined,
utm_campaign: deal.UTM_CAMPAIGN || undefined,
utm_content: deal.UTM_CONTENT || undefined,
utm_term: deal.UTM_TERM || undefined,
*/

-- =====================================================
-- STEP 2: Update database schema file
-- =====================================================

-- Update database-orders-schema.sql with new column sizes:
/*
service_type VARCHAR(500),    -- Increased from 100
city VARCHAR(200),           -- Increased from 100
order_date VARCHAR(200),     -- Increased from 100
order_time VARCHAR(200),     -- Increased from 100
utm_source VARCHAR(500),     -- Increased from 100
utm_medium VARCHAR(500),     -- Increased from 100
utm_campaign VARCHAR(500),   -- Increased from 100
utm_content VARCHAR(500),    -- Increased from 100
utm_term VARCHAR(500),       -- Increased from 100
*/

-- =====================================================
-- STEP 3: Test the changes
-- =====================================================

-- After updating the code:
-- 1. Run: npm run build
-- 2. Test sync: POST /api/orders/sync
-- 3. Verify no more truncation warnings
-- 4. Check that long values are preserved

-- =====================================================
-- STEP 4: Clean up (optional)
-- =====================================================

-- You can optionally remove the safeTruncate method if it's no longer used:
/*
// Remove this method if not used elsewhere:
private safeTruncate(value: string | undefined, maxLength: number, fieldName: string): string | undefined {
  // ... method body
}
*/
