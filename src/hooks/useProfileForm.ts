import { useState, useEffect, useCallback } from 'react';
import { PartnerInfo } from '@/hooks/usePartnerAuth';

// Interface for partner profile data (excludes admin-only fields)
interface PartnerProfileData {
  name: string;
  service_type: string;
  status: 'active' | 'pending' | 'inactive';
  rating: number;
  total_orders: number;
  total_revenue: number;
  location: string;
  city: string;
  state: string;
  pin_code: string;
  mobile: string;
  email: string;
  address: string;
  joined_date: string;
  last_active: string | null;
}

interface UseProfileFormProps {
  partnerInfo: PartnerInfo | null;
}

export function useProfileForm({ partnerInfo }: UseProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PartnerProfileData>({
    name: '',
    service_type: '',
    status: 'pending',
    rating: 0,
    total_orders: 0,
    total_revenue: 0,
    location: '',
    city: '',
    state: '',
    pin_code: '',
    mobile: '',
    email: '',
    address: '',
    joined_date: new Date().toISOString(),
    last_active: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<keyof PartnerProfileData, string | undefined>>({} as Record<keyof PartnerProfileData, string | undefined>);

  // Initialize form data when partner info changes
  useEffect(() => {
    if (partnerInfo) {
      setFormData({
        name: partnerInfo.name || '',
        service_type: partnerInfo.service_type || '',
        status: (partnerInfo.status as 'active' | 'pending' | 'inactive') || 'pending',
        rating: partnerInfo.rating || 0,
        total_orders: partnerInfo.total_orders || 0,
        total_revenue: partnerInfo.total_revenue || 0,
        location: partnerInfo.location || '',
        city: partnerInfo.city || '',
        state: partnerInfo.state || '',
        pin_code: partnerInfo.pin_code || '',
        mobile: partnerInfo.mobile || '',
        email: partnerInfo.email || '',
        address: partnerInfo.address || '',
        joined_date: partnerInfo.joined_date || new Date().toISOString(),
        last_active: partnerInfo.last_active || null
      });
    }
  }, [partnerInfo]);

  const handleInputChange = useCallback((field: keyof PartnerProfileData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<keyof PartnerProfileData, string | undefined> = {} as Record<keyof PartnerProfileData, string | undefined>;

    if (!formData.name.trim()) {
      newErrors.name = 'Partner name is required';
    }

    if (!formData.service_type.trim()) {
      newErrors.service_type = 'Service type is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.mobile)) {
      newErrors.mobile = 'Invalid mobile number format';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.rating < 0 || formData.rating > 5) {
      newErrors.rating = 'Rating must be between 0 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement API call to update partner profile
      console.log('Saving profile:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      // TODO: Show success message
    } catch (error) {
      console.error('Error saving profile:', error);
      // TODO: Show error message
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm]);

  const handleCancel = useCallback(() => {
    // Reset form data to original partner info
    if (partnerInfo) {
      setFormData({
        name: partnerInfo.name || '',
        service_type: partnerInfo.service_type || '',
        status: (partnerInfo.status as 'active' | 'pending' | 'inactive') || 'pending',
        rating: partnerInfo.rating || 0,
        total_orders: partnerInfo.total_orders || 0,
        total_revenue: partnerInfo.total_revenue || 0,
        location: partnerInfo.location || '',
        city: partnerInfo.city || '',
        state: partnerInfo.state || '',
        pin_code: partnerInfo.pin_code || '',
        mobile: partnerInfo.mobile || '',
        email: partnerInfo.email || '',
        address: partnerInfo.address || '',
        joined_date: partnerInfo.joined_date || new Date().toISOString(),
        last_active: partnerInfo.last_active || null
      });
    }
    setErrors({} as Record<keyof PartnerProfileData, string | undefined>);
    setIsEditing(false);
  }, [partnerInfo]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  return {
    formData,
    isEditing,
    loading,
    errors,
    handleInputChange,
    handleSave,
    handleCancel,
    handleEdit
  };
}
