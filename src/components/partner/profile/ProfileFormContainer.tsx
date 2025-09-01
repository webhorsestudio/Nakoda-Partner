import React from 'react';
import { Service } from '@/types/services';
import BasicInformationCard from './BasicInformationCard';
import ContactInformationCard from './ContactInformationCard';
import LocationInformationCard from './LocationInformationCard';
import AccountInformationCard from './AccountInformationCard';

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

interface ProfileFormContainerProps {
  formData: PartnerProfileData;
  isEditing: boolean;
  loading: boolean;
  errors: Record<keyof PartnerProfileData, string | undefined>;
  services: Service[];
  servicesLoading: boolean;
  onInputChange: (field: keyof PartnerProfileData, value: string | number | boolean) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProfileFormContainer({
  formData,
  isEditing,
  loading,
  errors,
  services,
  servicesLoading,
  onInputChange,
  onEdit,
  onSave,
  onCancel
}: ProfileFormContainerProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form Cards */}
        <div className="lg:col-span-2 space-y-6">
          <BasicInformationCard
            formData={formData}
            isEditing={isEditing}
            errors={errors}
            services={services}
            servicesLoading={servicesLoading}
            onInputChange={onInputChange}
          />
          
          <ContactInformationCard
            formData={formData}
            isEditing={isEditing}
            errors={errors}
            onInputChange={onInputChange}
          />
          
          <LocationInformationCard
            formData={formData}
            isEditing={isEditing}
            onInputChange={onInputChange}
          />
        </div>

        {/* Right Column - Account Info Only */}
        <div className="space-y-6">
          <AccountInformationCard 
            formData={formData}
            isEditing={isEditing}
            loading={loading}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
          />
        </div>
      </div>
    </div>
  );
}
