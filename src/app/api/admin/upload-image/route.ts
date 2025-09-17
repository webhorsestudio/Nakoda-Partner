import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { uploadPromotionalImage, validateImageFile } from '@/lib/storageUtils';

// POST /api/admin/upload-image - Upload promotional image to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    console.log('=== SUPABASE IMAGE UPLOAD API DEBUG ===');
    
    // Check admin authentication using JWT token
    const authResult = await verifyAdminToken(request);
    console.log('Auth check:', { success: authResult.success, error: authResult.error });
    
    if (!authResult.success) {
      console.log('Authentication failed:', authResult.error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ 
        error: validation.error 
      }, { status: 400 });
    }

    // Upload to Supabase Storage
    const result = await uploadPromotionalImage(file);
    
    if (!result.success) {
      console.error('Upload failed:', result.error);
      return NextResponse.json({ 
        error: result.error || 'Failed to upload image' 
      }, { status: 500 });
    }
    
    console.log('Image uploaded successfully to Supabase:', { 
      fileName: result.fileName, 
      imageUrl: result.imageUrl, 
      path: result.path 
    });

    return NextResponse.json({ 
      success: true,
      imageUrl: result.imageUrl,
      fileName: result.fileName,
      path: result.path,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
