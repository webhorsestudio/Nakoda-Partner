-- =====================================================
-- Fix Storage Policies for Task Completion Images
-- =====================================================

-- Drop existing policies that require auth.role() = 'authenticated'
DROP POLICY IF EXISTS "Authenticated users can upload task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update task completion images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete task completion images" ON storage.objects;

-- Create new policies that work with the partner authentication system
-- Since we're using mobile-based JWT authentication, we need to allow service_role access

-- Policy for service_role to upload task completion images
CREATE POLICY "Service role can upload task completion images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'task-completion-images' 
    AND auth.role() = 'service_role'
);

-- Policy for service_role to view task completion images
CREATE POLICY "Service role can view task completion images" ON storage.objects
FOR SELECT USING (
    bucket_id = 'task-completion-images' 
    AND auth.role() = 'service_role'
);

-- Policy for service_role to update task completion images
CREATE POLICY "Service role can update task completion images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'task-completion-images' 
    AND auth.role() = 'service_role'
);

-- Policy for service_role to delete task completion images
CREATE POLICY "Service role can delete task completion images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'task-completion-images' 
    AND auth.role() = 'service_role'
);

-- Alternative approach: Allow all operations for service_role on this bucket
-- This is more permissive but ensures the API works
CREATE POLICY "Service role full access to task completion images" ON storage.objects
FOR ALL USING (
    bucket_id = 'task-completion-images' 
    AND auth.role() = 'service_role'
);

-- =====================================================
-- Verify the bucket exists and is properly configured
-- =====================================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'task-completion-images';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'task-completion-images',
    'task-completion-images',
    true, -- Public bucket for easy access
    10485760, -- 10MB file size limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;
