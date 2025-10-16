import React from 'react';
import { 
  EyeIcon,
  PhoneIcon,
  MapPinIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PartnerWithAssignedOrders } from '@/hooks/useAssignedOrders';
import { 
  formatCurrency, 
  getStatusColor, 
  getVerificationStatusColor, 
  getOrderStatusColor 
} from './utils/formatters';

interface PartnerCardProps {
  partner: PartnerWithAssignedOrders;
  onViewPartner: (partner: PartnerWithAssignedOrders) => void;
}

export default function PartnerCard({ partner, onViewPartner }: PartnerCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Partner Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {partner.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Partner ID: #{partner.id}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(partner.status)}`}>
          {partner.status}
        </span>
      </div>

      {/* Partner Contact Info */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <PhoneIcon className="h-4 w-4 mr-2" />
          <span>{partner.mobile}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mb-1">
          <MapPinIcon className="h-4 w-4 mr-2" />
          <span>{partner.city}</span>
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-medium">Service:</span> {partner.serviceType}
        </div>
      </div>

      {/* Assigned Orders Summary */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-blue-900">Assigned Orders</h4>
          <span className="text-lg font-bold text-blue-900">{partner.assignedOrdersCount}</span>
        </div>
        <div className="text-sm text-blue-800 mb-1">
          <span className="font-medium">Total Amount:</span> {formatCurrency(partner.totalAssignedAmount)}
        </div>
        <div className="flex items-center text-xs text-blue-600">
          <StarIcon className="h-3 w-3 mr-1" />
          <span>{partner.rating}/5 rating</span>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Order Status Breakdown</h4>
        <div className="space-y-1">
          {Object.entries(partner.statusBreakdown).map(([status, count]) => (
            <div key={status} className="flex justify-between items-center text-xs">
              <span className={`px-2 py-1 rounded-full ${getOrderStatusColor(status)}`}>
                {status}
              </span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Status */}
      <div className="mb-4 p-2 bg-gray-50 rounded">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Verification</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getVerificationStatusColor(partner.verificationStatus)}`}>
            {partner.verificationStatus}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button
          onClick={() => onViewPartner(partner)}
          variant="outline"
          size="sm"
          className="flex items-center"
        >
          <EyeIcon className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </div>
    </Card>
  );
}
