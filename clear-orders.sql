-- Clean up duplicate bitrix24_id entries and reset orders table
-- This script will remove all existing orders and allow for a clean sync

-- First, let's see what duplicates we have
SELECT bitrix24_id, COUNT(*) as count
FROM orders 
GROUP BY bitrix24_id 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Remove all existing orders to start fresh
-- WARNING: This will delete ALL existing orders
DELETE FROM orders;

-- Reset the auto-increment sequence if you have one
-- (This is not needed for UUID primary keys, but included for completeness)
-- ALTER SEQUENCE IF EXISTS orders_id_seq RESTART WITH 1;

-- Verify the table is empty
SELECT COUNT(*) as total_orders FROM orders;

-- Now you can run the sync again and it will create fresh orders without duplicates
