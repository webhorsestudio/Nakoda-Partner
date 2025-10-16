"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  UserGroupIcon,
  PhoneIcon,
  MapPinIcon,
  StarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/ui/Pagination';
import { OrderCardSkeleton } from '@/components/ui/OrderCardSkeleton';
import { PartnerWithAssignedOrders, useAssignedOrders } from '@/hooks/useAssignedOrders';

export default function AssignedOrdersPage() {
  const {
    partners,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchTerm,
    dateFrom,
    dateTo,
    totalAssignedOrders,
    setSearchTerm,
    setDateFrom,
    setDateTo,
    setCurrentPage,
    refreshPartners
  } = useAssignedOrders();

  const [selectedPartner, setSelectedPartner] = useState<PartnerWithAssignedOrders | null>(null);
  const [showPartnerDetails, setShowPartnerDetails] = useState(false);

  const handleViewPartner = (partner: PartnerWithAssignedOrders) => {
    setSelectedPartner(partner);
    setShowPartnerDetails(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Partners</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshPartners} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assigned Orders Details</h1>
                     <p className="mt-1 text-sm text-gray-500">
                       {loading ? 'Loading partners...' : `View all partners with their assigned order counts (${totalItems} partners, ${totalAssignedOrders} total assigned orders)`}
                     </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} partners
              </div>
              <Button onClick={refreshPartners} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by partner name, mobile, email, service type, or city..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">From:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">To:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <OrderCardSkeleton key={index} />
            ))}
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Partners Found</h3>
                   <p className="text-gray-500">
                     {searchTerm || dateFrom || dateTo 
                       ? 'Try adjusting your search criteria or date filters.'
                       : 'There are currently no partners in the system.'
                     }
                   </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <Card key={partner.id} className="p-6 hover:shadow-lg transition-shadow">
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
                    onClick={() => handleViewPartner(partner)}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Partner Details Modal */}
      {showPartnerDetails && selectedPartner && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPartnerDetails(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Partner Details</h3>
                  <button
                    onClick={() => setShowPartnerDetails(false)}
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
                      <div><span className="font-medium">Name:</span> {selectedPartner.name}</div>
                      <div><span className="font-medium">Mobile:</span> {selectedPartner.mobile}</div>
                      <div><span className="font-medium">Email:</span> {selectedPartner.email}</div>
                      <div><span className="font-medium">Service Type:</span> {selectedPartner.serviceType}</div>
                      <div><span className="font-medium">City:</span> {selectedPartner.city}</div>
                      <div><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedPartner.status)}`}>
                          {selectedPartner.status}
                        </span>
                      </div>
                      <div><span className="font-medium">Verification Status:</span> 
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getVerificationStatusColor(selectedPartner.verificationStatus)}`}>
                          {selectedPartner.verificationStatus}
                        </span>
                      </div>
                      <div><span className="font-medium">Rating:</span> {selectedPartner.rating}/5</div>
                      <div><span className="font-medium">Total Orders:</span> {selectedPartner.totalOrders}</div>
                      <div><span className="font-medium">Total Revenue:</span> {formatCurrency(selectedPartner.totalRevenue)}</div>
                    </div>
                  </div>

                  {/* Assigned Orders Summary */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Assigned Orders Summary</h4>
                    <div className="space-y-2">
                      <div><span className="font-medium">Assigned Orders Count:</span> {selectedPartner.assignedOrdersCount}</div>
                      <div><span className="font-medium">Total Assigned Amount:</span> {formatCurrency(selectedPartner.totalAssignedAmount)}</div>
                      <div><span className="font-medium">Average Order Value:</span> {selectedPartner.assignedOrdersCount > 0 ? formatCurrency(selectedPartner.totalAssignedAmount / selectedPartner.assignedOrdersCount) : 'N/A'}</div>
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">Status Breakdown</h5>
                      <div className="space-y-1">
                        {Object.entries(selectedPartner.statusBreakdown).map(([status, count]) => (
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
                {selectedPartner.assignedOrders.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Assigned Orders</h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <div className="space-y-2">
                        {selectedPartner.assignedOrders.slice(0, 10).map((order, index) => (
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
                        {selectedPartner.assignedOrders.length > 10 && (
                          <div className="text-xs text-gray-500 text-center pt-2">
                            ... and {selectedPartner.assignedOrders.length - 10} more orders
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
                      <div><span className="font-medium">Joined Date:</span> {formatDate(selectedPartner.joinedDate)}</div>
                      <div><span className="font-medium">Last Active:</span> {selectedPartner.lastActive ? formatDate(selectedPartner.lastActive) : 'Never'}</div>
                      <div><span className="font-medium">Documents Verified:</span> {selectedPartner.documentsVerified ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                  
                  {selectedPartner.notes && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Notes</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">{selectedPartner.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowPartnerDetails(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
