-- Clear all existing orders to start fresh
DELETE FROM orders;

-- Reset the sequence if using auto-increment (not needed for UUID)
-- ALTER SEQUENCE orders_id_seq RESTART WITH 1;

-- Verify the table is empty
SELECT COUNT(*) as remaining_orders FROM orders;
