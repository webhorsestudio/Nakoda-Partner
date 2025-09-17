# Supabase Storage Setup for Promotional Images

This guide explains how to set up Supabase Storage for the promotional images feature.

## 🚀 Quick Setup

### 1. Run the Migration
Execute the SQL migration to create the storage bucket and policies:

```sql
-- Run this in your Supabase SQL Editor
-- File: migration-create-promotional-images-storage.sql
```

### 2. Verify Bucket Creation
In your Supabase Dashboard:
1. Go to **Storage** → **Buckets**
2. Verify that `promotional-images` bucket exists
3. Check that it's set to **Public**

### 3. Test Upload Functionality
1. Navigate to `/admin/settings/partner-slider`
2. Click **Edit** on any promotional image
3. Switch to **Upload Image** tab
4. Upload a test image

## 📁 Storage Structure

```
promotional-images/
├── promo-{timestamp}-{random}.jpg
├── promo-{timestamp}-{random}.png
└── promo-{timestamp}-{random}.webp
```

## 🔧 Configuration Details

### Bucket Settings
- **Name**: `promotional-images`
- **Public**: `true` (for direct image access)
- **File Size Limit**: 5MB
- **Allowed MIME Types**: 
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
  - `image/gif`

### Storage Policies
1. **Upload**: Authenticated users can upload images
2. **View**: Anyone can view images (public bucket)
3. **Update**: Authenticated users can update images
4. **Delete**: Authenticated users can delete images

## 🛠️ API Endpoints

### Upload Image
```
POST /api/admin/upload-image
Content-Type: multipart/form-data

Body:
- image: File (required)

Response:
{
  "success": true,
  "imageUrl": "https://your-project.supabase.co/storage/v1/object/public/promotional-images/promo-1234567890-abc123.jpg",
  "fileName": "promo-1234567890-abc123.jpg",
  "path": "promo-1234567890-abc123.jpg",
  "size": 1024000,
  "type": "image/jpeg"
}
```

### Delete Image
```
POST /api/admin/delete-image
Content-Type: application/json

Body:
{
  "imageUrl": "https://your-project.supabase.co/storage/v1/object/public/promotional-images/promo-1234567890-abc123.jpg"
}

Response:
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## 🔒 Security Features

### Authentication
- All upload/delete operations require admin JWT token
- Policies enforce authenticated user access

### File Validation
- **Type**: Only image files allowed
- **Size**: Maximum 5MB per file
- **Extension**: Validated against MIME type

### Unique Filenames
- Format: `promo-{timestamp}-{random}.{ext}`
- Prevents conflicts and security issues
- Timestamp ensures uniqueness

## 📱 Frontend Integration

### EditImageModal Features
- **Toggle Interface**: Switch between URL and Upload
- **Drag & Drop**: Intuitive file selection
- **Progress Indication**: Visual feedback during upload
- **Error Handling**: Clear error messages
- **Auto Cleanup**: Deletes old images when replacing

### Image Preview
- **Live Preview**: Shows uploaded images immediately
- **Gradient Background**: Displays with promotional styling
- **Error States**: Graceful fallback for failed loads

## 🧪 Testing

### Manual Testing
1. **Upload Test**: Use the test file `test-upload.html`
2. **Edit Modal**: Test upload functionality in edit modal
3. **Error Cases**: Test with invalid files, oversized files
4. **Cleanup**: Verify old images are deleted when replaced

### Test Scenarios
- ✅ Valid image upload (JPEG, PNG, WebP, GIF)
- ✅ File size validation (max 5MB)
- ✅ File type validation
- ✅ Authentication required
- ✅ Old image cleanup
- ✅ Error handling
- ✅ Public URL generation

## 🔧 Troubleshooting

### Common Issues

#### 1. Bucket Not Found
```
Error: Bucket 'promotional-images' not found
```
**Solution**: Run the migration SQL in Supabase

#### 2. Permission Denied
```
Error: Permission denied
```
**Solution**: Check storage policies and user authentication

#### 3. File Too Large
```
Error: File too large. Maximum size is 5MB.
```
**Solution**: Compress image or use smaller file

#### 4. Invalid File Type
```
Error: Invalid file type
```
**Solution**: Use supported formats (JPEG, PNG, WebP, GIF)

### Debug Steps
1. Check Supabase Dashboard → Storage → Buckets
2. Verify policies in Storage → Policies
3. Check browser console for errors
4. Verify authentication token
5. Test with smaller files first

## 📊 Monitoring

### Storage Usage
- Monitor bucket size in Supabase Dashboard
- Set up alerts for storage limits
- Regular cleanup of unused images

### Performance
- Images are cached with 1-hour cache control
- CDN distribution for global access
- Optimized for web delivery

## 🚀 Production Considerations

### Environment Variables
Ensure these are set in production:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Backup Strategy
- Regular database backups include storage metadata
- Consider image backup for critical assets
- Test restore procedures

### Scaling
- Supabase Storage scales automatically
- Consider image optimization for large volumes
- Monitor usage and costs

## 📝 Migration Notes

### From Local Storage
If migrating from local file storage:
1. Run the Supabase migration
2. Update API endpoints
3. Migrate existing images to Supabase
4. Update image URLs in database
5. Remove local storage code

### Database Updates
The promotional images table doesn't need changes - only the storage backend changes from local files to Supabase Storage.
