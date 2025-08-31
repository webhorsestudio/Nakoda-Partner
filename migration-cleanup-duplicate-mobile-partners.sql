-- Migration: Cleanup Duplicate Mobile Numbers in Partners Table
-- This script identifies and resolves duplicate mobile numbers by keeping the most recent/active partner

-- First, let's see what duplicates we have
WITH duplicate_mobiles AS (
  SELECT 
    mobile,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE status = 'Active') as active_count,
    COUNT(*) FILTER (WHERE status = 'Pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'Suspended') as suspended_count
  FROM partners 
  WHERE mobile IS NOT NULL AND mobile != ''
  GROUP BY mobile 
  HAVING COUNT(*) > 1
)
SELECT * FROM duplicate_mobiles ORDER BY count DESC;

-- Create a backup table before making changes
CREATE TABLE IF NOT EXISTS partners_backup_duplicate_cleanup AS 
SELECT * FROM partners;

-- Function to clean up duplicates while keeping the best partner
DO $$
DECLARE
  mobile_record RECORD;
  partner_record RECORD;
  best_partner_id INTEGER;
  deleted_count INTEGER := 0;
BEGIN
  -- Loop through each mobile number with duplicates
  FOR mobile_record IN 
    SELECT mobile, COUNT(*) as count
    FROM partners 
    WHERE mobile IS NOT NULL AND mobile != ''
    GROUP BY mobile 
    HAVING COUNT(*) > 1
  LOOP
    -- Find the best partner to keep (prioritize Active > Pending > Suspended, then most recent)
    SELECT id INTO best_partner_id
    FROM partners 
    WHERE mobile = mobile_record.mobile
    ORDER BY 
      CASE status 
        WHEN 'Active' THEN 1
        WHEN 'Pending' THEN 2
        WHEN 'Suspended' THEN 3
        ELSE 4
      END,
      updated_at DESC,
      created_at DESC
    LIMIT 1;
    
    -- Delete all other partners with the same mobile number
    DELETE FROM partners 
    WHERE mobile = mobile_record.mobile 
    AND id != best_partner_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Mobile %: Kept partner ID %, deleted % duplicates', 
      mobile_record.mobile, best_partner_id, deleted_count;
  END LOOP;
  
  RAISE NOTICE 'Duplicate mobile cleanup completed';
END $$;

-- Verify the cleanup
SELECT 
  mobile,
  COUNT(*) as count
FROM partners 
WHERE mobile IS NOT NULL AND mobile != ''
GROUP BY mobile 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Show final partner count
SELECT COUNT(*) as total_partners FROM partners;

-- Optional: Drop backup table if everything looks good
-- DROP TABLE partners_backup_duplicate_cleanup;
