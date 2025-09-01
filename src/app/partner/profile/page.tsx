"use client";

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { useServices } from '@/hooks/useServices';
import { useProfileForm } from '@/hooks/useProfileForm';
import { BottomNavigation } from '@/components/partner';
import {
  ProfileHeader,
  ProfileFormContainer,
  ProfileLoadingState,
  ProfileErrorState
} from '@/components/partner/profile';

export default function PartnerProfilePage() {
  const router = useRouter();
  const { partnerInfo, error, isLoading } = usePartnerAuth();
  const { services, servicesLoading } = useServices();
  
  const {
    formData,
    isEditing,
    loading,
    errors,
    handleInputChange,
    handleSave,
    handleCancel,
    handleEdit
  } = useProfileForm({ partnerInfo });

  const handleBack = useCallback(() => {
    router.push('/partner');
  }, [router]);

  const handleTabChange = useCallback((tabId: string) => {
    if (tabId === 'profile') {
      // Stay on profile page
      return;
    }
    // Navigate to other tabs
    router.push(`/partner?tab=${tabId}`);
  }, [router]);

  // Show loading state
  if (isLoading) {
    return <ProfileLoadingState />;
  }

  // Show error if any
  if (error) {
    return <ProfileErrorState error={error} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <ProfileHeader onBack={handleBack} />

      {/* Main Content */}
      <ProfileFormContainer
        formData={formData}
        isEditing={isEditing}
        loading={loading}
        errors={errors}
        services={services}
        servicesLoading={servicesLoading}
        onInputChange={handleInputChange}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="profile"
        onTabChange={handleTabChange}
      />
    </div>
  );
}
