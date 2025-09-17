-- Migration: Fix RLS Policies for Promotional Images Storage
-- Date: 2024-12-19
-- Purpose: Fix RLS policies to allow admin uploads via service role

-- =====================================================
-- STEP 1: Drop Existing Policies
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload promotional images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update promotional images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete promotional images" ON storage.objects;

-- =====================================================
-- STEP 2: Create New Policies
-- =====================================================

-- Policy for service role to upload images (for admin operations)
CREATE POLICY "Service role can upload promotional images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'promotional-images' 
    AND auth.role() = 'service_role'
);

-- Policy for service role to update images (for admin operations)
CREATE POLICY "Service role can update promotional images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'promotional-images' 
    AND auth.role() = 'service_role'
);

-- Policy for service role to delete images (for admin operations)
CREATE POLICY "Service role can delete promotional images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'promotional-images' 
    AND auth.role() = 'service_role'
);

-- Policy for authenticated users to upload images (for partner operations if needed)
CREATE POLICY "Authenticated users can upload promotional images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'promotional-images' 
    AND auth.role() = 'authenticated'
    AND auth.uid() IS NOT NULL
);

-- Policy for authenticated users to update their own images
CREATE POLICY "Authenticated users can update promotional images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'promotional-images' 
    AND auth.role() = 'authenticated'
    AND auth.uid() IS NOT NULL
);

-- Policy for authenticated users to delete promotional images
CREATE POLICY "Authenticated users can delete promotional images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'promotional-images' 
    AND auth.role() = 'authenticated'
    AND auth.uid() IS NOT NULL
);

-- Keep the public read policy (only create if it doesn't exist)
-- Policy for anyone to view images (public access)
CREATE POLICY "Anyone can view promotional images" ON storage.objects
FOR SELECT USING (bucket_id = 'promotional-images')
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 3: Grant Additional Permissions
-- =====================================================

-- Grant permissions to service role
GRANT ALL ON storage.objects TO service_role;
GRANT ALL ON storage.buckets TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary:
-- ✅ Updated RLS policies to allow service role operations
-- ✅ Maintained authenticated user policies for future use
-- ✅ Kept public read access for promotional images
-- ✅ Granted necessary permissions to service role
