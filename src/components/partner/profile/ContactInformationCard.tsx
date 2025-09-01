import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface ContactInformationCardProps {
  formData: PartnerProfileData;
  isEditing: boolean;
  errors: Record<keyof PartnerProfileData, string | undefined>;
  onInputChange: (field: keyof PartnerProfileData, value: string | number | boolean) => void;
}

export default function ContactInformationCard({
  formData,
  isEditing,
  errors,
  onInputChange
}: ContactInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number *
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => onInputChange('mobile', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.mobile ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter mobile number"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                {formData.mobile || 'Not specified'}
              </p>
            )}
            {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                {formData.email || 'Not specified'}
              </p>
            )}
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
