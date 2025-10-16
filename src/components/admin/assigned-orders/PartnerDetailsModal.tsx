import React from 'react';
import { PartnerWithAssignedOrders } from '@/hooks/useAssignedOrders';
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getVerificationStatusColor, 
  getOrderStatusColor 
} from './utils/formatters';

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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Partner Details</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Partner Information */}
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

              {/* Assigned Orders Summary */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Assigned Orders Summary</h4>
                <div className="space-y-2">
                  <div><span className="font-medium">Assigned Orders Count:</span> {partner.assignedOrdersCount}</div>
                  <div><span className="font-medium">Total Assigned Amount:</span> {formatCurrency(partner.totalAssignedAmount)}</div>
                  <div><span className="font-medium">Average Order Value:</span> {partner.assignedOrdersCount > 0 ? formatCurrency(partner.totalAssignedAmount / partner.assignedOrdersCount) : 'N/A'}</div>
                </div>
                
                <div className="mt-4">
                  <h5 className="text-sm font-semibold text-gray-900 mb-2">Status Breakdown</h5>
                  <div className="space-y-1">
                    {Object.entries(partner.statusBreakdown).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center text-sm">
                        <span className={`px-2 py-1 rounded-full ${getOrderStatusColor(status)}`}>
                          {status}
                        </span>
                        <span className="font-medium">{count} orders</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Orders List */}
            {partner.assignedOrders.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Assigned Orders</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {partner.assignedOrders.slice(0, 10).map((order, index) => (
                      <div key={index} className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span>{formatCurrency(order.amount)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(order.serviceDate)}
                        </div>
                      </div>
                    ))}
                    {partner.assignedOrders.length > 10 && (
                      <div className="text-xs text-gray-500 text-center pt-2">
                        ... and {partner.assignedOrders.length - 10} more orders
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info */}
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
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
