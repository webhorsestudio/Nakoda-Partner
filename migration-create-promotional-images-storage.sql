-- Migration: Create Supabase Storage Bucket for Promotional Images
-- Date: 2024-12-19
-- Purpose: Set up storage bucket for promotional image uploads

-- =====================================================
-- STEP 1: Create Storage Bucket
-- =====================================================

-- Create the promotional-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'promotional-images',
    'promotional-images',
    true,
    5242880, -- 5MB in bytes
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 2: Create Storage Policies
-- =====================================================

-- Policy for authenticated users to upload images
CREATE POLICY "Authenticated users can upload promotional images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'promotional-images' 
    AND auth.role() = 'authenticated'
    AND auth.uid() IS NOT NULL
);

-- Policy for authenticated users to view images
CREATE POLICY "Anyone can view promotional images" ON storage.objects
FOR SELECT USING (bucket_id = 'promotional-images');

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

-- =====================================================
-- STEP 3: Grant Permissions
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- =====================================================
-- STEP 4: Create Helper Functions
-- =====================================================

-- Function to get public URL for promotional images
CREATE OR REPLACE FUNCTION get_promotional_image_url(image_path TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'https://' || current_setting('app.settings.supabase_url') || '/storage/v1/object/public/promotional-images/' || image_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique filename for promotional images
CREATE OR REPLACE FUNCTION generate_promotional_image_filename(original_name TEXT)
RETURNS TEXT AS $$
DECLARE
    file_extension TEXT;
    timestamp_str TEXT;
    random_str TEXT;
BEGIN
    -- Extract file extension
    file_extension := split_part(original_name, '.', array_length(string_to_array(original_name, '.'), 1));
    
    -- Generate timestamp
    timestamp_str := extract(epoch from now())::text;
    
    -- Generate random string
    random_str := substr(md5(random()::text), 1, 8);
    
    -- Return unique filename
    RETURN 'promo-' || timestamp_str || '-' || random_str || '.' || file_extension;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary:
-- ✅ Created promotional-images storage bucket
-- ✅ Set up storage policies for CRUD operations
-- ✅ Granted necessary permissions
-- ✅ Created helper functions for URL generation and filename creation
-- ✅ Configured file size limit (5MB) and allowed MIME types
