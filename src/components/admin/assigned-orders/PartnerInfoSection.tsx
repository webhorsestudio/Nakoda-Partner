import React from 'react';
import { PartnerWithAssignedOrders } from '@/hooks/useAssignedOrders';
import { 
  formatCurrency, 
  getStatusColor, 
  getVerificationStatusColor 
} from './utils/formatters';

interface PartnerInfoSectionProps {
  partner: PartnerWithAssignedOrders;
}

export default function PartnerInfoSection({ partner }: PartnerInfoSectionProps) {
  return (
    <div>
      <h4 className="text-md font-semibold text-gray-900 mb-3">Partner Information</h4>
      <div className="space-y-2">
        <div><span className="font-medium">Name:</span> {partner.name}</div>
        <div><span className="font-medium">Mobile:</span> {partner.mobile}</div>
        <div><span className="font-medium">Email:</span> {partner.email}</div>
        <div><span className="font-medium">Service Type:</span> {partner.serviceType}</div>
        <div><span className="font-medium">City:</span> {partner.city}</div>
        <div><span className="font-medium">Status:</span> 
          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(partner.status)}`}>
            {partner.status}
          </span>
        </div>
        <div><span className="font-medium">Verification Status:</span> 
          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getVerificationStatusColor(partner.verificationStatus)}`}>
            {partner.verificationStatus}
          </span>
        </div>
        <div><span className="font-medium">Rating:</span> {partner.rating}/5</div>
        <div><span className="font-medium">Total Orders:</span> {partner.totalOrders}</div>
        <div><span className="font-medium">Total Revenue:</span> {formatCurrency(partner.totalRevenue)}</div>
      </div>
    </div>
  );
}
