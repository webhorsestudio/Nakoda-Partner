import React from 'react';
import { UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Service } from '@/types/services';

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

interface BasicInformationCardProps {
  formData: PartnerProfileData;
  isEditing: boolean;
  errors: Record<keyof PartnerProfileData, string | undefined>;
  services: Service[];
  servicesLoading: boolean;
  onInputChange: (field: keyof PartnerProfileData, value: string | number | boolean) => void;
}

export default function BasicInformationCard({
  formData,
  isEditing,
  errors,
  services,
  servicesLoading,
  onInputChange
}: BasicInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserIcon className="h-5 w-5 text-blue-600" />
          <span>Basic Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partner Name *
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => onInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter partner name"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                {formData.name || 'Not specified'}
              </p>
            )}
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type *
            </label>
            {isEditing ? (
              <select
                value={formData.service_type}
                onChange={(e) => onInputChange('service_type', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.service_type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select service type</option>
                {servicesLoading ? (
                  <option value="">Loading services...</option>
                ) : (
                  services.map(service => (
                    <option key={service.id} value={service.name}>{service.name}</option>
                  ))
                )}
              </select>
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                {formData.service_type || 'Not specified'}
              </p>
            )}
            {errors.service_type && <p className="mt-1 text-sm text-red-600">{errors.service_type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                formData.status === 'active' ? 'bg-green-100 text-green-800' :
                formData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {formData.status || 'Not specified'}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
              {formData.rating ? `${formData.rating}/5` : 'Not rated'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
