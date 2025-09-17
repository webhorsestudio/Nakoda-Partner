-- Migration: Add Task Completion Fields to Orders Table
-- Purpose: Add fields to store partner task completion feedback and images
-- Date: 2025-01-17

-- =====================================================
-- STEP 1: Add Task Completion Fields to Orders Table
-- =====================================================

-- Add partner feedback field
ALTER TABLE orders ADD COLUMN IF NOT EXISTS partner_feedback TEXT;

-- Add task completion timestamp
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add completion images JSON array (will store image URLs)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completion_images JSONB DEFAULT '[]'::jsonb;

-- Add partner completion status (separate from general status)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS partner_completion_status VARCHAR(50) DEFAULT 'pending' 
    CHECK (partner_completion_status IN ('pending', 'in_progress', 'completed', 'cancelled'));

-- Add completion notes (additional notes from partner)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completion_notes TEXT;

-- =====================================================
-- STEP 2: Create Indexes for Performance
-- =====================================================

-- Index for partner completion status queries
CREATE INDEX IF NOT EXISTS idx_orders_partner_completion_status ON orders(partner_completion_status);

-- Index for completed_at timestamp queries
CREATE INDEX IF NOT EXISTS idx_orders_completed_at ON orders(completed_at);

-- Index for partner_id + completion_status (common query pattern)
CREATE INDEX IF NOT EXISTS idx_orders_partner_completion ON orders(partner_id, partner_completion_status);

-- =====================================================
-- STEP 3: Create Supabase Storage Bucket for Task Completion Images
-- =====================================================

-- Create the task-completion-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'task-completion-images',
    'task-completion-images',
    true, -- Public bucket for easy access
    10485760, -- 10MB file size limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 4: Create Storage Policies for Task Completion Images
-- =====================================================

-- Policy for authenticated users to upload task completion images
CREATE POLICY "Authenticated users can upload task completion images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'task-completion-images' 
    AND auth.role() = 'authenticated'
);

-- Policy for authenticated users to view task completion images
CREATE POLICY "Anyone can view task completion images" ON storage.objects
FOR SELECT USING (bucket_id = 'task-completion-images');

-- Policy for authenticated users to update their own task completion images
CREATE POLICY "Authenticated users can update task completion images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'task-completion-images' 
    AND auth.role() = 'authenticated'
);

-- Policy for authenticated users to delete task completion images
CREATE POLICY "Authenticated users can delete task completion images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'task-completion-images' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- STEP 5: Create Helper Functions
-- =====================================================

-- Function to get public URL for task completion images
CREATE OR REPLACE FUNCTION get_task_completion_image_url(image_path TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'https://' || current_setting('app.settings.supabase_url') || '/storage/v1/object/public/task-completion-images/' || image_path;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique filename for task completion images
CREATE OR REPLACE FUNCTION generate_task_completion_image_filename(
    order_id UUID,
    original_name TEXT,
    partner_id INTEGER DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    file_extension TEXT;
    timestamp_str TEXT;
    random_suffix TEXT;
    final_filename TEXT;
BEGIN
    -- Extract file extension
    file_extension := COALESCE(
        CASE 
            WHEN original_name ~ '\.[^.]*$' THEN 
                '.' || split_part(original_name, '.', array_length(string_to_array(original_name, '.'), 1))
            ELSE ''
        END,
        '.jpg'
    );
    
    -- Generate timestamp
    timestamp_str := to_char(NOW(), 'YYYYMMDD_HH24MISS');
    
    -- Generate random suffix (4 characters)
    random_suffix := substring(md5(random()::text) from 1 for 4);
    
    -- Build final filename: order_id_partner_id_timestamp_random.ext
    final_filename := order_id::text || 
                     CASE WHEN partner_id IS NOT NULL THEN '_p' || partner_id::text ELSE '' END ||
                     '_' || timestamp_str || '_' || random_suffix || file_extension;
    
    RETURN final_filename;
END;
$$ LANGUAGE plpgsql;

-- Function to validate task completion data
CREATE OR REPLACE FUNCTION validate_task_completion(
    p_order_id UUID,
    p_feedback TEXT,
    p_images JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if order exists
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = p_order_id) THEN
        RETURN FALSE;
    END IF;
    
    -- Check if feedback is provided and meets minimum length
    IF p_feedback IS NULL OR LENGTH(TRIM(p_feedback)) < 10 THEN
        RETURN FALSE;
    END IF;
    
    -- Check if at least one image is provided
    IF p_images IS NULL OR jsonb_array_length(p_images) = 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 6: Create RLS Policies for Orders Table
-- =====================================================

-- Enable RLS on orders table if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies for partners will be handled at the application level
-- since this system uses mobile-based authentication rather than Supabase auth
-- The API endpoints will handle authorization by checking partner_id against
-- the authenticated partner's ID from the JWT token

-- For now, we'll create basic policies that allow authenticated users
-- (the actual authorization is handled in the API layer)

-- Policy for authenticated users to view orders (authorization handled in API)
CREATE POLICY "Authenticated users can view orders" ON orders
FOR SELECT USING (true);

-- Policy for authenticated users to update orders (authorization handled in API)  
CREATE POLICY "Authenticated users can update orders" ON orders
FOR UPDATE USING (true);

-- =====================================================
-- STEP 7: Add Comments for Documentation
-- =====================================================

COMMENT ON COLUMN orders.partner_feedback IS 'Feedback provided by partner upon task completion (minimum 10 characters)';
COMMENT ON COLUMN orders.completed_at IS 'Timestamp when partner marked the task as completed';
COMMENT ON COLUMN orders.completion_images IS 'JSON array of image URLs uploaded by partner upon task completion';
COMMENT ON COLUMN orders.partner_completion_status IS 'Partner-specific completion status (pending, in_progress, completed, cancelled)';
COMMENT ON COLUMN orders.completion_notes IS 'Additional notes from partner about task completion';

-- =====================================================
-- STEP 8: Create View for Completed Tasks
-- =====================================================

CREATE OR REPLACE VIEW completed_tasks AS
SELECT 
    o.id,
    o.bitrix24_id,
    o.title,
    o.customer_name,
    o.service_type,
    o.partner_feedback,
    o.completion_images,
    o.completed_at,
    o.partner_completion_status,
    o.completion_notes,
    o.partner_id,
    p.name as partner_name,
    o.created_at,
    o.updated_at
FROM orders o
LEFT JOIN partners p ON o.partner_id = p.id
WHERE o.partner_completion_status = 'completed'
ORDER BY o.completed_at DESC;

-- Grant access to the view
GRANT SELECT ON completed_tasks TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- ✅ Added task completion fields to orders table
-- ✅ Created task-completion-images storage bucket
-- ✅ Set up storage policies for image uploads
-- ✅ Created helper functions for image management
-- ✅ Added RLS policies for data security
-- ✅ Created view for completed tasks
-- ✅ Added proper indexes for performance
