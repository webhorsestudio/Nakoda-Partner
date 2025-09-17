import React, { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, 
  PhotoIcon, 
  EyeIcon, 
  LinkIcon, 
  ClockIcon,
  UserGroupIcon,
  PaintBrushIcon,
  CogIcon,
  CloudArrowUpIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import { PromotionalImage } from '@/types/promotionalImages';
import { parseDateTimeLocal, formatDateTimeLocal } from '@/utils/timestampUtils';

interface EditImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: PromotionalImage | null;
  onSave: (id: number | null, updateData: Partial<PromotionalImage>) => Promise<boolean>;
  isCreating?: boolean;
}

export function EditImageModal({ isOpen, onClose, image, onSave, isCreating = false }: EditImageModalProps) {
  const [formData, setFormData] = useState<Partial<PromotionalImage>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when image changes or when creating
  useEffect(() => {
    if (isCreating) {
      // Initialize with default values for new image
      setFormData({
        title: '',
        subtitle: '',
        button_text: 'Learn More',
        brand_name: 'Nakoda Partner',
        image_url: '',
        image_alt: '',
        gradient_from: 'blue-600',
        gradient_to: 'indigo-600',
        display_order: 0,
        auto_rotate_duration: 5000,
        action_type: 'button',
        action_url: '',
        action_target: '_self',
        target_audience: 'all',
        is_active: true,
        expires_at: undefined
      });
      setErrors({});
      setImagePreviewError(false);
      setUploadError(null);
      setImageSource('url');
    } else if (image) {
      // Initialize with existing image data
      setFormData({
        title: image.title,
        subtitle: image.subtitle || '',
        button_text: image.button_text,
        brand_name: image.brand_name,
        image_url: image.image_url,
        image_alt: image.image_alt || '',
        gradient_from: image.gradient_from,
        gradient_to: image.gradient_to,
        display_order: image.display_order,
        auto_rotate_duration: image.auto_rotate_duration,
        action_type: image.action_type,
        action_url: image.action_url || '',
        action_target: image.action_target,
        target_audience: image.target_audience,
        is_active: image.is_active,
        expires_at: image.expires_at || undefined
      });
      setErrors({});
      setImagePreviewError(false);
      setUploadError(null);
      setImageSource('url');
    }
  }, [image, isCreating]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.image_url?.trim()) {
      newErrors.image_url = 'Image is required';
    } else if (imageSource === 'url' && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'Please enter a valid URL';
    }

    // Additional validation for create mode
    if (isCreating) {
      if (!formData.brand_name?.trim()) {
        newErrors.brand_name = 'Brand name is required';
      }
      if (!formData.button_text?.trim()) {
        newErrors.button_text = 'Button text is required';
      }
    }

    if (formData.subtitle && formData.subtitle.length > 300) {
      newErrors.subtitle = 'Subtitle must be less than 300 characters';
    }

    if (formData.action_type === 'link' && !formData.action_url?.trim()) {
      newErrors.action_url = 'Action URL is required when action type is link';
    } else if (formData.action_type === 'link' && formData.action_url && !isValidUrl(formData.action_url)) {
      newErrors.action_url = 'Please enter a valid URL';
    }

    if (formData.auto_rotate_duration && (formData.auto_rotate_duration < 1000 || formData.auto_rotate_duration > 30000)) {
      newErrors.auto_rotate_duration = 'Auto rotate duration must be between 1000ms and 30000ms';
    }

    if (formData.display_order && (formData.display_order < 0 || formData.display_order > 999)) {
      newErrors.display_order = 'Display order must be between 0 and 999';
    }

    // Validate expires_at if provided
    if (formData.expires_at && formData.expires_at !== undefined) {
      const expiresDate = new Date(formData.expires_at);
      if (isNaN(expiresDate.getTime())) {
        newErrors.expires_at = 'Invalid expiration date';
      } else if (expiresDate <= new Date()) {
        newErrors.expires_at = 'Expiration date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const imageId = isCreating ? null : image?.id || null;
      const success = await onSave(imageId, formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PromotionalImage, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Reset image preview error when URL changes
    if (field === 'image_url') {
      setImagePreviewError(false);
    }
  };

  const handleImageError = () => {
    setImagePreviewError(true);
  };

  const getGradientStyle = () => {
    if (!formData.gradient_from || !formData.gradient_to) return {};
    return {
      background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
      '--tw-gradient-from': `rgb(${getColorValue(formData.gradient_from)})`,
      '--tw-gradient-to': `rgb(${getColorValue(formData.gradient_to)})`,
    } as React.CSSProperties;
  };

  const getColorValue = (colorClass: string) => {
    const colorMap: Record<string, string> = {
      'blue-600': '59, 130, 246',
      'green-600': '34, 197, 94',
      'purple-600': '147, 51, 234',
      'red-600': '239, 68, 68',
      'yellow-600': '234, 179, 8',
      'indigo-600': '79, 70, 229',
      'blue-700': '29, 78, 216',
      'green-700': '21, 128, 61',
      'purple-700': '126, 34, 206',
      'red-700': '185, 28, 28',
      'yellow-700': '180, 83, 9',
    };
    return colorMap[colorClass] || '59, 130, 246';
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);

    try {
      // Store the old image URL for deletion
      const oldImageUrl = formData.image_url;

      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update form data with the uploaded image URL
      setFormData(prev => ({ ...prev, image_url: result.imageUrl }));
      setImagePreviewError(false);

      // Delete the old image if it exists and is from Supabase Storage
      if (oldImageUrl && oldImageUrl.includes('supabase')) {
        await handleDeleteOldImage();
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleImageSourceChange = (source: 'url' | 'upload') => {
    setImageSource(source);
    setUploadError(null);
    if (source === 'upload' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteOldImage = async () => {
    if (!formData.image_url) return;

    try {
      const response = await fetch('/api/admin/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: formData.image_url })
      });

      if (response.ok) {
        console.log('Old image deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting old image:', error);
    }
  };

  if (!isOpen || (!image && !isCreating)) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <PhotoIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {isCreating ? 'Create New Promotional Image' : 'Edit Promotional Image'}
                </h3>
                <p className="text-blue-100 text-sm">
                  {isCreating ? 'Add a new promotional image to the slider' : 'Update image settings and configuration'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-120px)]">
            <div className="p-6 space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <PhotoIcon className="h-5 w-5 text-blue-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
                  <div className="lg:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.title 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Enter image title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Subtitle */}
                  <div className="lg:col-span-2">
                    <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                id="subtitle"
                value={formData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter subtitle"
              />
                    {errors.subtitle && <p className="mt-1 text-sm text-red-600">{errors.subtitle}</p>}
                  </div>

                  {/* Brand Name */}
                  <div>
                    <label htmlFor="brand_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Name {isCreating && '*'}
                    </label>
                    <input
                      type="text"
                      id="brand_name"
                      value={formData.brand_name || ''}
                      onChange={(e) => handleChange('brand_name', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.brand_name 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="Enter brand name"
                    />
                    {errors.brand_name && <p className="mt-1 text-sm text-red-600">{errors.brand_name}</p>}
                  </div>

                  {/* Button Text */}
                  <div>
                    <label htmlFor="button_text" className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text {isCreating && '*'}
                    </label>
                    <input
                      type="text"
                      id="button_text"
                      value={formData.button_text || ''}
                      onChange={(e) => handleChange('button_text', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.button_text 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="Enter button text"
                    />
                    {errors.button_text && <p className="mt-1 text-sm text-red-600">{errors.button_text}</p>}
                  </div>
                </div>
              </div>

              {/* Image Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <PhotoIcon className="h-5 w-5 text-green-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Image Configuration</h4>
                </div>
                
                <div className="space-y-6">
                  {/* Image Source Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Image Source *
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => handleImageSourceChange('url')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                          imageSource === 'url'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <LinkIcon className="h-4 w-4" />
                        <span>Image URL</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleImageSourceChange('upload')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                          imageSource === 'upload'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <CloudArrowUpIcon className="h-4 w-4" />
                        <span>Upload Image</span>
                      </button>
                    </div>
            </div>

                  {/* Image URL Input */}
                  {imageSource === 'url' && (
            <div>
                      <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                id="image_url"
                value={formData.image_url || ''}
                onChange={(e) => handleChange('image_url', e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.image_url 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image_url && <p className="mt-1 text-sm text-red-600">{errors.image_url}</p>}
            </div>
                  )}

                  {/* File Upload */}
                  {imageSource === 'upload' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Image *
                      </label>
                      <div className="relative">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            uploadError
                              ? 'border-red-300 bg-red-50'
                              : uploading
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          <div className="text-center">
                            {uploading ? (
                              <div className="flex flex-col items-center space-y-2">
                                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                <p className="text-sm text-blue-600">Uploading...</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center space-y-2">
                                <DocumentArrowUpIcon className="h-8 w-8 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    Click to upload or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PNG, JPG, WebP, GIF up to 5MB
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {uploadError && (
                        <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                      )}
                    </div>
                  )}

            {/* Image Preview */}
            {formData.image_url && (
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                      <div className="relative">
                        <div 
                          className="w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 flex items-center justify-center"
                          style={getGradientStyle()}
                        >
                          {!imagePreviewError ? (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                              className="max-w-full max-h-full object-cover"
                              onError={handleImageError}
                            />
                          ) : (
                            <div className="text-center text-gray-500">
                              <PhotoIcon className="h-12 w-12 mx-auto mb-2" />
                              <p className="text-sm">Failed to load image</p>
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          {formData.gradient_from} → {formData.gradient_to}
                        </div>
                </div>
              </div>
            )}
                </div>
            </div>

              {/* Action Configuration */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <LinkIcon className="h-5 w-5 text-purple-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Action Configuration</h4>
            </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Action Type */}
            <div>
                    <label htmlFor="action_type" className="block text-sm font-medium text-gray-700 mb-2">
                Action Type
              </label>
              <select
                id="action_type"
                value={formData.action_type || 'button'}
                onChange={(e) => handleChange('action_type', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="button">Button</option>
                <option value="link">Link</option>
                <option value="none">None</option>
              </select>
            </div>

                  {/* Action Target */}
                  <div>
                    <label htmlFor="action_target" className="block text-sm font-medium text-gray-700 mb-2">
                      Action Target
                    </label>
                    <select
                      id="action_target"
                      value={formData.action_target || '_self'}
                      onChange={(e) => handleChange('action_target', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="_self">Same Tab</option>
                      <option value="_blank">New Tab</option>
                    </select>
                  </div>

            {/* Action URL */}
            {formData.action_type === 'link' && (
                    <div className="lg:col-span-2">
                      <label htmlFor="action_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Action URL *
                </label>
                <input
                  type="url"
                  id="action_url"
                  value={formData.action_url || ''}
                  onChange={(e) => handleChange('action_url', e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.action_url 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="https://example.com"
                />
                {errors.action_url && <p className="mt-1 text-sm text-red-600">{errors.action_url}</p>}
              </div>
            )}
                </div>
              </div>

              {/* Display Settings */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CogIcon className="h-5 w-5 text-orange-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Display Settings</h4>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Target Audience */}
            <div>
                    <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 mb-2">
                      <UserGroupIcon className="h-4 w-4 inline mr-1" />
                Target Audience
              </label>
              <select
                id="target_audience"
                value={formData.target_audience || 'all'}
                onChange={(e) => handleChange('target_audience', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Partners</option>
                <option value="new">New Partners</option>
                <option value="active">Active Partners</option>
                <option value="inactive">Inactive Partners</option>
              </select>
            </div>

                  {/* Display Order */}
                  <div>
                    <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      id="display_order"
                      value={formData.display_order || 0}
                      onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)}
                      min="0"
                      max="999"
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.display_order 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                    />
                    {errors.display_order && <p className="mt-1 text-sm text-red-600">{errors.display_order}</p>}
                  </div>

                  {/* Auto Rotate Duration */}
                  <div>
                    <label htmlFor="auto_rotate_duration" className="block text-sm font-medium text-gray-700 mb-2">
                      <ClockIcon className="h-4 w-4 inline mr-1" />
                      Auto Rotate Duration (ms)
                    </label>
                    <input
                      type="number"
                      id="auto_rotate_duration"
                      value={formData.auto_rotate_duration || 5000}
                      onChange={(e) => handleChange('auto_rotate_duration', parseInt(e.target.value))}
                      min="1000"
                      max="30000"
                      step="1000"
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.auto_rotate_duration 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                    />
                    {errors.auto_rotate_duration && <p className="mt-1 text-sm text-red-600">{errors.auto_rotate_duration}</p>}
                  </div>

                  {/* Expires At */}
                  <div>
                    <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 mb-2">
                      Expires At (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      id="expires_at"
                      value={formatDateTimeLocal(formData.expires_at)}
                      onChange={(e) => handleChange('expires_at', parseDateTimeLocal(e.target.value))}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.expires_at 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                    />
                    {errors.expires_at && <p className="mt-1 text-sm text-red-600">{errors.expires_at}</p>}
                  </div>
                </div>
              </div>

              {/* Visual Settings */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <PaintBrushIcon className="h-5 w-5 text-pink-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Visual Settings</h4>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gradient From */}
              <div>
                    <label htmlFor="gradient_from" className="block text-sm font-medium text-gray-700 mb-2">
                  Gradient From
                </label>
                <select
                  id="gradient_from"
                  value={formData.gradient_from || 'blue-600'}
                  onChange={(e) => handleChange('gradient_from', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="blue-600">Blue</option>
                  <option value="green-600">Green</option>
                  <option value="purple-600">Purple</option>
                  <option value="red-600">Red</option>
                  <option value="yellow-600">Yellow</option>
                  <option value="indigo-600">Indigo</option>
                </select>
              </div>

                  {/* Gradient To */}
              <div>
                    <label htmlFor="gradient_to" className="block text-sm font-medium text-gray-700 mb-2">
                  Gradient To
                </label>
                <select
                  id="gradient_to"
                  value={formData.gradient_to || 'indigo-600'}
                  onChange={(e) => handleChange('gradient_to', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="indigo-600">Indigo</option>
                  <option value="blue-700">Blue Dark</option>
                  <option value="green-700">Green Dark</option>
                  <option value="purple-700">Purple Dark</option>
                  <option value="red-700">Red Dark</option>
                  <option value="yellow-700">Yellow Dark</option>
                </select>
              </div>
            </div>
            </div>

            {/* Status */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <EyeIcon className="h-5 w-5 text-emerald-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Status</h4>
                </div>
                
                <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active || false}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
                    Active (Image will be displayed on partner dashboard)
              </label>
            </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 p-6 bg-gray-50 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border-2 border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>{isCreating ? 'Creating...' : 'Saving...'}</span>
                  </div>
                ) : (
                  isCreating ? 'Create Image' : 'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
