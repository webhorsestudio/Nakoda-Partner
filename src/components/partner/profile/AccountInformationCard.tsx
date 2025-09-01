import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { EditIcon, SaveIcon, XIcon } from 'lucide-react';

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

interface AccountInformationCardProps {
  formData: PartnerProfileData;
  isEditing: boolean;
  loading: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function AccountInformationCard({ 
  formData, 
  isEditing, 
  loading, 
  onEdit, 
  onSave, 
  onCancel 
}: AccountInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Joined Date</span>
          <span className="text-sm text-gray-900">
            {formData.joined_date ? new Date(formData.joined_date).toLocaleDateString() : 'Not specified'}
          </span>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Last Active</span>
          <span className="text-sm text-gray-900">
            {formData.last_active ? new Date(formData.last_active).toLocaleDateString() : 'Not specified'}
          </span>
        </div>
        
        {/* Edit Profile Button Section */}
        <Separator />
        <div className="pt-4">
          {!isEditing ? (
            <Button
              onClick={onEdit}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <EditIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={onSave}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="w-full"
              >
                <XIcon className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
