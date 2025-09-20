-- Migration: Complete Fix for Storage RLS Policies
-- Purpose: Fix all RLS policies for task completion images
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

-- =====================================================
-- STEP 2: Ensure Storage Bucket Exists
-- =====================================================

-- Create the task-completion-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('task-completion-images', 'task-completion-images', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 3: Create Proper RLS Policies
-- =====================================================

-- Policy for authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload task completion images"
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'task-completion-images');

-- Policy for anyone to view images (public bucket)
CREATE POLICY "Allow public to view task completion images"
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'task-completion-images');

-- Policy for authenticated users to update images
CREATE POLICY "Allow authenticated users to update task completion images"
ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'task-completion-images');

-- Policy for authenticated users to delete images
CREATE POLICY "Allow authenticated users to delete task completion images"
ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'task-completion-images');

-- =====================================================
-- STEP 4: Grant Permissions
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- =====================================================
-- STEP 5: Verify Bucket Configuration
-- =====================================================

-- Update bucket to ensure it's properly configured
UPDATE storage.buckets 
SET 
    public = TRUE,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'task-completion-images';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- ✅ Dropped all conflicting policies
-- ✅ Created proper RLS policies
-- ✅ Ensured bucket exists and is configured
-- ✅ Granted necessary permissions
-- ✅ Images should now upload successfully
