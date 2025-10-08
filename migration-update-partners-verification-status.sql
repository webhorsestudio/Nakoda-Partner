-- Migration: Update Partners Verification Status
-- Description: Updates all partners to have verification_status = 'Verified' and documents_verified = true
-- Date: 2025-01-27
-- Author: System Migration

-- Update verification status and documents verified for all partners
UPDATE public.partners 
SET 
    verification_status = 'Verified',
    documents_verified = true,
    updated_at = NOW()
WHERE 
    verification_status != 'Verified' 
    OR documents_verified != true
    OR verification_status IS NULL 
    OR documents_verified IS NULL;

-- Verify the update by checking the counts
SELECT 
    verification_status,
    documents_verified,
    COUNT(*) as partner_count
FROM public.partners 
WHERE deleted_at IS NULL
GROUP BY verification_status, documents_verified
ORDER BY verification_status, documents_verified;

-- Show total updated partners
SELECT 
    COUNT(*) as total_verified_partners
FROM public.partners 
WHERE 
    verification_status = 'Verified' 
    AND documents_verified = true
    AND deleted_at IS NULL;

-- Optional: Show any partners that might not have been updated (for debugging)
SELECT 
    id,
    name,
    verification_status,
    documents_verified,
    created_at
FROM public.partners 
WHERE 
    (verification_status != 'Verified' OR verification_status IS NULL)
    OR (documents_verified != true OR documents_verified IS NULL)
    AND deleted_at IS NULL
ORDER BY created_at DESC;
