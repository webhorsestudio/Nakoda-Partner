-- Migration: Update Partner Verification Status from Pending to Verified
-- This script updates all partners with verification_status = 'Pending' to 'Verified'

-- First, let's see how many partners currently have 'Pending' status
SELECT 
  verification_status,
  COUNT(*) as count,
  array_agg(name) as partner_names
FROM partners 
WHERE verification_status = 'Pending'
GROUP BY verification_status;

-- Update all partners with 'Pending' verification status to 'Verified'
UPDATE partners 
SET 
  verification_status = 'Verified',
  updated_at = NOW()
WHERE verification_status = 'Pending';

-- Verify the update was successful
SELECT 
  verification_status,
  COUNT(*) as count
FROM partners 
GROUP BY verification_status
ORDER BY verification_status;

-- Show updated partners
SELECT 
  id,
  name,
  mobile,
  verification_status,
  updated_at
FROM partners 
WHERE verification_status = 'Verified'
ORDER BY updated_at DESC
LIMIT 10;

-- Optional: Also update documents_verified to true for newly verified partners
-- (Uncomment the following lines if you want to set documents_verified = true as well)
/*
UPDATE partners 
SET 
  documents_verified = true,
  updated_at = NOW()
WHERE verification_status = 'Verified' 
  AND documents_verified = false;
*/

-- Final verification query
SELECT 
  'Migration Summary' as summary,
  COUNT(*) FILTER (WHERE verification_status = 'Verified') as verified_count,
  COUNT(*) FILTER (WHERE verification_status = 'Pending') as pending_count,
  COUNT(*) FILTER (WHERE verification_status = 'Rejected') as rejected_count,
  COUNT(*) as total_partners
FROM partners;
