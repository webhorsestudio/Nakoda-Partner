-- Migration: Fix Storage Policies for Task Completion Images
-- Purpose: Fix RLS policies to allow image uploads for task completion
-- Date: 2025-01-17

-- =====================================================
-- STEP 1: Create Storage Bucket (if not exists)
-- =====================================================

-- Create the task-completion-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('task-completion-images', 'task-completion-images', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 2: Drop Existing Policies (if any)
-- =====================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Partners can upload task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Partners can update their own task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Partners can delete their own task completion images" ON storage.objects;

-- =====================================================
-- STEP 3: Create New Storage Policies
-- =====================================================

-- Policy for partners to upload images
CREATE POLICY "Partners can upload task completion images"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'task-completion-images' AND
    auth.uid() IS NOT NULL
);

-- Policy for anyone to view uploaded images (public bucket)
CREATE POLICY "Anyone can view task completion images"
ON storage.objects FOR SELECT TO public USING (bucket_id = 'task-completion-images');

-- Policy for partners to update their own images (if needed, e.g., replace)
CREATE POLICY "Partners can update their own task completion images"
ON storage.objects FOR UPDATE TO authenticated USING (
    bucket_id = 'task-completion-images' AND
    auth.uid() IS NOT NULL
);

-- Policy for partners to delete their own images (if needed)
CREATE POLICY "Partners can delete their own task completion images"
ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'task-completion-images' AND
    auth.uid() IS NOT NULL
);

-- =====================================================
-- STEP 4: Grant Permissions
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- ✅ Created task-completion-images bucket
-- ✅ Fixed RLS policies for image uploads
-- ✅ Set up proper permissions
-- ✅ Images can now be uploaded successfully