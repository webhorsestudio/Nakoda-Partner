import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Create admin client with service role key for storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tujaxamxrdkkdvwnjcxh.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Log warning if service role key is not available
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not found. Using anon key as fallback. This may cause RLS policy issues.');
}

const supabaseAdmin = createClient<Database>(
  supabaseUrl, 
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export interface StorageUploadResult {
  success: boolean;
  imageUrl?: string;
  fileName?: string;
  path?: string;
  error?: string;
}

export interface StorageDeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadPromotionalImage(
  file: File,
  fileName?: string
): Promise<StorageUploadResult> {
  try {
    // Generate unique filename if not provided
    if (!fileName) {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      fileName = `promo-${timestamp}-${randomString}.${fileExtension}`;
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage using admin client
    const { data, error } = await supabaseAdmin.storage
      .from('promotional-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('promotional-images')
      .getPublicUrl(fileName);

    return {
      success: true,
      imageUrl: urlData.publicUrl,
      fileName,
      path: data.path
    };

  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deletePromotionalImage(
  fileName: string
): Promise<StorageDeleteResult> {
  try {
    const { error } = await supabaseAdmin.storage
      .from('promotional-images')
      .remove([fileName]);

    if (error) {
      console.error('Supabase storage delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Error deleting image from Supabase:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
}

/**
 * Extract filename from Supabase Storage URL
 */
export function extractFileNameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    return fileName || null;
  } catch {
    return null;
  }
}

/**
 * Validate file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 5MB.'
    };
  }

  return { valid: true };
}
