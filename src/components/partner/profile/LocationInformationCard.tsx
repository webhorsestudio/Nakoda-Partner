import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { INDIAN_STATES } from '@/types/partners';

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

interface LocationInformationCardProps {
  formData: PartnerProfileData;
  isEditing: boolean;
  onInputChange: (field: keyof PartnerProfileData, value: string | number | boolean) => void;
}

export default function LocationInformationCard({
  formData,
  isEditing,
  onInputChange
}: LocationInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.city}
                onChange={(e) => onInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter city"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                {formData.city || 'Not specified'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            {isEditing ? (
              <select
                value={formData.state}
                onChange={(e) => onInputChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                {formData.state || 'Not specified'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PIN Code
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.pin_code}
                onChange={(e) => onInputChange('pin_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter PIN code"
                maxLength={10}
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                {formData.pin_code || 'Not specified'}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.location}
              onChange={(e) => onInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full location"
            />
          ) : (
            <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
              {formData.location || 'Not specified'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          {isEditing ? (
            <textarea
              value={formData.address}
              onChange={(e) => onInputChange('address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full address"
            />
          ) : (
            <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
              {formData.address || 'Not specified'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
