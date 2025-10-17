import React from 'react';
import { PartnerWithAssignedOrders } from '@/hooks/useAssignedOrders';
import ModalHeader from './ModalHeader';
import PartnerInfoSection from './PartnerInfoSection';
import AssignedOrdersSummary from './AssignedOrdersSummary';
import RecentAssignedOrders from './RecentAssignedOrders';
import AdditionalInfoSection from './AdditionalInfoSection';
import ModalFooter from './ModalFooter';

interface PartnerDetailsModalProps {
  isOpen: boolean;
  partner: PartnerWithAssignedOrders | null;
  onClose: () => void;
}

export default function PartnerDetailsModal({ 
  isOpen, 
  partner, 
  onClose 
}: PartnerDetailsModalProps) {
  if (!isOpen || !partner) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <ModalHeader title="Partner Details" onClose={onClose} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PartnerInfoSection partner={partner} />
              <AssignedOrdersSummary partner={partner} />
            </div>

            <RecentAssignedOrders assignedOrders={partner.assignedOrders} />
            <AdditionalInfoSection partner={partner} />
          </div>
          
          <ModalFooter onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
