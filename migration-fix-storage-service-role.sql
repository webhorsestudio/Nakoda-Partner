-- Migration: Fix Storage for Service Role Access
-- Purpose: Ensure service role can upload images without RLS restrictions
-- Date: 2025-01-17

-- =====================================================
-- STEP 1: Drop ALL Existing Policies
-- =====================================================

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Partners can upload task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Partners can update their own task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Partners can delete their own task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete task completion images" ON storage.objects;

-- =====================================================
-- STEP 2: Ensure Storage Bucket Exists and is Public
-- =====================================================

-- Create the task-completion-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('task-completion-images', 'task-completion-images', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Update bucket to ensure it's public
UPDATE storage.buckets 
SET 
    public = TRUE,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'task-completion-images';

-- =====================================================
-- STEP 3: Create Simple RLS Policies
-- =====================================================

-- Simple policy for uploads - allow all authenticated users
CREATE POLICY "Allow uploads to task completion images"
ON storage.objects FOR INSERT 
TO authenticated, service_role
WITH CHECK (bucket_id = 'task-completion-images');

-- Simple policy for viewing - allow everyone
CREATE POLICY "Allow viewing task completion images"
ON storage.objects FOR SELECT 
TO public, authenticated, service_role
USING (bucket_id = 'task-completion-images');

-- Simple policy for updates - allow all authenticated users
CREATE POLICY "Allow updates to task completion images"
ON storage.objects FOR UPDATE 
TO authenticated, service_role
USING (bucket_id = 'task-completion-images');

-- Simple policy for deletes - allow all authenticated users
CREATE POLICY "Allow deletes of task completion images"
ON storage.objects FOR DELETE 
TO authenticated, service_role
USING (bucket_id = 'task-completion-images');

-- =====================================================
-- STEP 4: Grant Permissions
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO service_role;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.buckets TO service_role;

-- =====================================================
-- STEP 5: Disable RLS Temporarily for Testing
-- =====================================================

-- Temporarily disable RLS on storage.objects for testing
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- ✅ Dropped all conflicting policies
-- ✅ Created simple RLS policies for all roles
-- ✅ Ensured bucket is public
-- ✅ Granted permissions to service_role
-- ✅ Service role should now be able to upload images
