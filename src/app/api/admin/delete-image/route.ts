import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { deletePromotionalImage, extractFileNameFromUrl } from '@/lib/storageUtils';

// POST /api/admin/delete-image - Delete promotional image from Supabase Storage
export async function POST(request: NextRequest) {
  try {
    console.log('=== SUPABASE IMAGE DELETE API DEBUG ===');
    
    // Check admin authentication using JWT token
    const authResult = await verifyAdminToken(request);
    console.log('Auth check:', { success: authResult.success, error: authResult.error });
    
    if (!authResult.success) {
      console.log('Authentication failed:', authResult.error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Extract filename from URL
    const fileName = extractFileNameFromUrl(imageUrl);
    if (!fileName) {
      return NextResponse.json({ 
        error: 'Invalid image URL format' 
      }, { status: 400 });
    }

    // Delete from Supabase Storage
    const result = await deletePromotionalImage(fileName);
    
    if (!result.success) {
      console.error('Delete failed:', result.error);
      return NextResponse.json({ 
        error: result.error || 'Failed to delete image' 
      }, { status: 500 });
    }
    
    console.log('Image deleted successfully from Supabase:', { fileName });

    return NextResponse.json({ 
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image from Supabase:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
