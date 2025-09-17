-- Migration: Add Service Role Policies for Promotional Images Storage
-- Date: 2024-12-19
-- Purpose: Add service role policies to allow admin uploads

-- =====================================================
-- STEP 1: Add Service Role Policies
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

-- =====================================================
-- STEP 2: Grant Service Role Permissions
-- =====================================================

-- Grant permissions to service role
GRANT ALL ON storage.objects TO service_role;
GRANT ALL ON storage.buckets TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary:
-- ✅ Added service role policies for CRUD operations
-- ✅ Granted necessary permissions to service role
-- ✅ Admin uploads should now work properly
