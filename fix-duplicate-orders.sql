-- Fix duplicate bitrix24_id entries by keeping only the most recent version
-- This approach preserves data while removing duplicates

-- First, let's see what duplicates we have
SELECT bitrix24_id, COUNT(*) as count
FROM orders 
GROUP BY bitrix24_id 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Create a temporary table with the most recent order for each bitrix24_id
WITH latest_orders AS (
  SELECT DISTINCT ON (bitrix24_id) 
    id,
    bitrix24_id,
    updated_at
  FROM orders 
  ORDER BY bitrix24_id, updated_at DESC
)
-- Delete all orders except the most recent one for each bitrix24_id
DELETE FROM orders 
WHERE id NOT IN (
  SELECT id FROM latest_orders
);

-- Verify the cleanup
SELECT bitrix24_id, COUNT(*) as count
FROM orders 
GROUP BY bitrix24_id 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Show final count
SELECT COUNT(*) as total_orders FROM orders;
