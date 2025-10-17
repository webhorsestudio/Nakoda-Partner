import React from 'react';
import { PartnerWithAssignedOrders } from '@/hooks/useAssignedOrders';
import { formatDate } from './utils/formatters';

interface AdditionalInfoSectionProps {
  partner: PartnerWithAssignedOrders;
}

export default function AdditionalInfoSection({ partner }: AdditionalInfoSectionProps) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Additional Information</h4>
        <div className="space-y-2">
          <div><span className="font-medium">Joined Date:</span> {formatDate(partner.joinedDate)}</div>
          <div><span className="font-medium">Last Active:</span> {partner.lastActive ? formatDate(partner.lastActive) : 'Never'}</div>
          <div><span className="font-medium">Documents Verified:</span> {partner.documentsVerified ? 'Yes' : 'No'}</div>
        </div>
      </div>
      
      {partner.notes && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">Notes</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">{partner.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
