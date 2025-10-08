-- Migration: Update Partners Wallet Balance to 100
-- Description: Updates all partners to have wallet_balance = 100.00
-- Date: 2025-01-27
-- Author: System Migration

-- Update wallet balance for all partners
UPDATE public.partners 
SET 
    wallet_balance = 100.00,
    wallet_updated_at = NOW(),
    last_transaction_at = NOW(),
    updated_at = NOW()
WHERE 
    wallet_balance != 100.00 
    OR wallet_balance IS NULL;

-- Verify the update by checking wallet balance distribution
SELECT 
    CASE 
        WHEN wallet_balance = 100.00 THEN '100.00'
        WHEN wallet_balance < 100.00 THEN 'Less than 100'
        WHEN wallet_balance > 100.00 THEN 'More than 100'
        WHEN wallet_balance IS NULL THEN 'NULL'
        ELSE 'Other'
    END as balance_range,
    COUNT(*) as partner_count
FROM public.partners 
WHERE deleted_at IS NULL
GROUP BY 
    CASE 
        WHEN wallet_balance = 100.00 THEN '100.00'
        WHEN wallet_balance < 100.00 THEN 'Less than 100'
        WHEN wallet_balance > 100.00 THEN 'More than 100'
        WHEN wallet_balance IS NULL THEN 'NULL'
        ELSE 'Other'
    END
ORDER BY balance_range;

-- Show total partners with 100.00 wallet balance
SELECT 
    COUNT(*) as total_partners_with_100_balance,
    SUM(wallet_balance) as total_wallet_amount
FROM public.partners 
WHERE 
    wallet_balance = 100.00
    AND deleted_at IS NULL;

-- Show wallet balance statistics
SELECT 
    MIN(wallet_balance) as min_balance,
    MAX(wallet_balance) as max_balance,
    AVG(wallet_balance) as avg_balance,
    COUNT(*) as total_partners
FROM public.partners 
WHERE deleted_at IS NULL;

-- Optional: Show any partners that might not have been updated (for debugging)
SELECT 
    id,
    name,
    wallet_balance,
    wallet_status,
    wallet_updated_at,
    created_at
FROM public.partners 
WHERE 
    wallet_balance != 100.00 
    OR wallet_balance IS NULL
    AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10;
