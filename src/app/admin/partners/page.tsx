"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { usePartners } from "@/hooks/usePartners";
import { useServices } from "@/hooks/useServices";
import { Partner, PartnerFormData, PARTNER_STATUSES, VERIFICATION_STATUSES } from "@/types/partners";
import { PartnerForm } from "@/components/partners";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getUserRole, canAccessPartners, UserRole } from "@/utils/roleUtils";

// Loading component for Suspense fallback
function PartnersLoadingSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Permission denied component
const PermissionDenied = () => (
  <div className="text-center py-12">
    <div className="mx-auto h-12 w-12 text-gray-400">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
    <p className="mt-1 text-sm text-gray-500">
      You don&apos;t have permission to access the Partners section.
    </p>
    <div className="mt-6">
      <a
        href="/admin"
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        Go to Dashboard
      </a>
    </div>
  </div>
);

export default function PartnersPage() {
  const [isClient, setIsClient] = useState(false);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  
  // Bulk operations state
  const [selectedPartners, setSelectedPartners] = useState<Set<number>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [showBulkPermanentDeleteModal, setShowBulkPermanentDeleteModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<Partner['status']>('active');
  const [bulkLoading, setBulkLoading] = useState(false);

  const router = useRouter();

  // Use our custom hook
  const {
    partners,
    stats,
    loading,
    loadingStats,
    error,
    currentPage,
    totalPages,
    filters,
    fetchPartners,
    createPartner,
    updatePartner,
    deletePartner,
    updatePartnerStatus,
    nextPage,
    prevPage,
    goToPage,
    updateFilters,
    clearFilters,
    permanentlyDeleteMultiplePartners
  } = usePartners(10);

  const { services, fetchServices } = useServices();

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch services when component mounts
  useEffect(() => {
    if (isClient) {
      fetchServices();
    }
  }, [isClient, fetchServices]);

  // Check user role and permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Get user mobile from localStorage token
        const token = localStorage.getItem('auth-token');
        if (token) {
          // Decode token to get mobile (simplified approach)
          const decoded = JSON.parse(atob(token.split('.')[1] || '{}'));
          if (decoded.mobile || decoded.phone) {
            const mobile = decoded.mobile || decoded.phone;
            const role = await getUserRole(mobile);
            setUserRole(role);
            if (role && canAccessPartners(role)) {
              setPermissionsLoading(false);
            } else {
              toast.error("You don't have permission to access Partners");
              router.push('/admin');
            }
          } else {
            toast.error("Invalid user session");
            router.push('/admin');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        toast.error("Error checking permissions");
        router.push('/admin');
      }
    };

    if (isClient) {
      checkPermissions();
    }
  }, [isClient, router]);

  // Handle search
  const handleSearchChange = useCallback((searchTerm: string) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  // Handle status filter
  const handleStatusFilterChange = useCallback((status: string) => {
    updateFilters({ status: status === 'all' ? undefined : status });
  }, [updateFilters]);

  // Handle service type filter
  const handleServiceTypeFilterChange = useCallback((serviceType: string) => {
    updateFilters({ service_type: serviceType === 'all' ? undefined : serviceType });
  }, [updateFilters]);

  // Handle verification status filter
  const handleVerificationFilterChange = useCallback((verificationStatus: string) => {
    updateFilters({ verification_status: verificationStatus === 'all' ? undefined : verificationStatus });
  }, [updateFilters]);

  // Handle partner deletion
  const handleDeletePartner = useCallback(async (id: number) => {
    try {
      await deletePartner(id);
      toast.success("Partner deactivated successfully");
      setShowDeleteConfirm(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to deactivate partner: ${errorMessage}`);
      console.error("Error deactivating partner:", error);
    }
  }, [deletePartner]);

  // Handle status update
  const handleStatusUpdate = useCallback(async (id: number, newStatus: Partner['status']) => {
    try {
      await updatePartnerStatus(id, newStatus);
      toast.success("Partner status updated successfully");
    } catch (error) {
      toast.error("Failed to update partner status");
      console.error("Error updating partner status:", error);
    }
  }, [updatePartnerStatus]);

  // Handle form submission for creating partner
  const handleCreatePartner = useCallback(async (partnerData: PartnerFormData) => {
    try {
      await createPartner(partnerData);
      toast.success("Partner created successfully");
    } catch (error) {
      toast.error("Failed to create partner");
      throw error;
    }
  }, [createPartner]);

  // Handle form submission for updating partner
  const handleUpdatePartner = useCallback(async (partnerData: PartnerFormData) => {
    if (!selectedPartner) return;
    
    try {
      await updatePartner(selectedPartner.id, partnerData);
      toast.success("Partner updated successfully");
      setSelectedPartner(null);
    } catch (error) {
      toast.error("Failed to update partner");
      throw error;
    }
  }, [updatePartner, selectedPartner]);

  // Bulk operations functions
  const handleSelectPartner = useCallback((partnerId: number, checked: boolean) => {
    setSelectedPartners(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(partnerId);
      } else {
        newSet.delete(partnerId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAllPartners = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedPartners(new Set(partners.map(p => p.id)));
    } else {
      setSelectedPartners(new Set());
    }
  }, [partners]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedPartners.size === 0) return;
    
    setBulkLoading(true);
    try {
      const deletePromises = Array.from(selectedPartners).map(id => deletePartner(id));
      await Promise.all(deletePromises);
      
      toast.success(`Successfully deactivated ${selectedPartners.size} partners`);
      setSelectedPartners(new Set());
      setShowBulkDeleteModal(false);
      
      // Refresh the partners list
      await fetchPartners();
      } catch (error) {
      toast.error("Failed to deactivate some partners");
      console.error("Bulk delete error:", error);
    } finally {
      setBulkLoading(false);
    }
  }, [selectedPartners, deletePartner, fetchPartners]);

  const handleBulkStatusChange = useCallback(async () => {
    if (selectedPartners.size === 0) return;
    
    setBulkLoading(true);
    try {
      const statusPromises = Array.from(selectedPartners).map(id => 
        updatePartnerStatus(id, bulkStatus)
      );
      await Promise.all(statusPromises);
      
      toast.success(`Successfully updated status for ${selectedPartners.size} partners to ${bulkStatus}`);
      setSelectedPartners(new Set());
      setShowBulkStatusModal(false);
      
      // Refresh the partners list
      await fetchPartners();
    } catch (error) {
      toast.error("Failed to update status for some partners");
      console.error("Bulk status change error:", error);
    } finally {
      setBulkLoading(false);
    }
  }, [selectedPartners, bulkStatus, updatePartnerStatus, fetchPartners]);

  const handleBulkPermanentDelete = useCallback(async () => {
    if (selectedPartners.size === 0) return;
    
    setBulkLoading(true);
    try {
      // Convert Set to array and call the bulk delete function
      const partnerIds = Array.from(selectedPartners);
      await permanentlyDeleteMultiplePartners(partnerIds);
      
      toast.success(`Successfully deleted ${selectedPartners.size} partners permanently`);
      setSelectedPartners(new Set());
      setShowBulkPermanentDeleteModal(false);
      
      // Refresh the partners list
      await fetchPartners();
        } catch (error) {
      toast.error("Failed to delete some partners permanently");
      console.error("Bulk permanent delete error:", error);
    } finally {
      setBulkLoading(false);
    }
  }, [selectedPartners, permanentlyDeleteMultiplePartners, fetchPartners]);

  const clearSelectedPartners = useCallback(() => {
    setSelectedPartners(new Set());
  }, []);

  // Show loading state during hydration
  if (!isClient) {
    return <PartnersLoadingSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading partners</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <button
                onClick={() => fetchPartners()}
                className="mt-3 text-sm font-medium text-red-800 hover:text-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show permission denied if user doesn't have access
  if (isClient && !permissionsLoading && userRole && !canAccessPartners(userRole)) {
    return <PermissionDenied />;
  }

  // Show loading while checking permissions
  if (permissionsLoading) {
    return <PartnersLoadingSkeleton />;
  }

  return (
    <Suspense fallback={<PartnersLoadingSkeleton />}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage and monitor all service partners on the platform
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
            <button
              type="button"
              onClick={() => setShowAddPartner(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Partner
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search partners..."
              value={filters.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>
          
          <select
            value={filters.status || "all"}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Status</option>
            {PARTNER_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={filters.service_type || "all"}
            onChange={(e) => handleServiceTypeFilterChange(e.target.value)}
            className="rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Services</option>
            {services.map(service => (
              <option key={service.id} value={service.name}>{service.name}</option>
            ))}
          </select>

          <select
            value={filters.verification_status || "all"}
            onChange={(e) => handleVerificationFilterChange(e.target.value)}
            className="rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Verification</option>
            {VERIFICATION_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedPartners.size > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedPartners.size} partner{selectedPartners.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={clearSelectedPartners}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear selection
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowBulkStatusModal(true)}
                  disabled={bulkLoading}
                  className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Change Status
                </button>
                <button
                  onClick={() => setShowBulkDeleteModal(true)}
                  disabled={bulkLoading}
                  className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deactivate (Soft Delete)
                </button>
                <button
                  onClick={() => setShowBulkPermanentDeleteModal(true)}
                  disabled={bulkLoading}
                  className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Partner Stats */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Partners</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loadingStats ? "..." : stats?.total_partners || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Partners</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loadingStats ? "..." : stats?.active_partners || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Verification</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loadingStats ? "..." : stats?.pending_partners || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Rating</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loadingStats ? "..." : stats?.average_rating || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partners Table */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                {loading ? (
                  <div className="bg-white p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading partners...</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={partners.length > 0 && selectedPartners.size === partners.length}
                            onChange={(e) => handleSelectAllPartners(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Partner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {partners.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                            {loading ? "Loading partners..." : "No partners found"}
                          </td>
                        </tr>
                      ) : (
                        partners.map((partner) => (
                          <tr key={partner.id}>
                            <td className="whitespace-nowrap px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedPartners.has(partner.id)}
                                onChange={(e) => handleSelectPartner(partner.id, e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <UserGroupIcon className="h-5 w-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {partner.location || `${partner.city || ''} ${partner.state || ''}`.trim() || 'Location not specified'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="text-sm text-gray-900">{partner.service_type}</div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <select
                                value={partner.status}
                                onChange={(e) => handleStatusUpdate(partner.id, e.target.value as Partner['status'])}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                  partner.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                                  partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  partner.status === 'inactive' ? 'bg-red-100 text-red-800 border-red-200' :
                                  'bg-gray-100 text-gray-800 border-gray-200'
                                }`}
                              >
                                {PARTNER_STATUSES.map(status => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-900">{partner.rating}</span>
                                <span className="text-yellow-400 ml-1">⭐</span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {partner.total_orders}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              ₹{partner.total_revenue?.toLocaleString() || '0'}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  className="text-blue-600 hover:text-blue-900"
                                  onClick={() => setSelectedPartner(partner)}
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button 
                                  className="text-indigo-600 hover:text-indigo-900"
                                  onClick={() => setSelectedPartner(partner)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button 
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => setShowDeleteConfirm(partner.id)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page > totalPages) return null;
                
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this partner? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeletePartner(showDeleteConfirm)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Partner Form Modal */}
        <PartnerForm
          isOpen={showAddPartner}
          onClose={() => setShowAddPartner(false)}
          onSubmit={handleCreatePartner}
          mode="create"
        />

        <PartnerForm
          partner={selectedPartner}
          isOpen={!!selectedPartner}
          onClose={() => setSelectedPartner(null)}
          onSubmit={handleUpdatePartner}
          mode="edit"
        />

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                  <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-orange-900 mb-4">Confirm Bulk Deactivation</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to deactivate {selectedPartners.size} selected partner{selectedPartners.size !== 1 ? 's' : ''}?
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
                  <p className="text-sm text-orange-800">
                    <strong>Note:</strong> This will deactivate the partners (soft delete). Their data will be preserved but they won&apos;t be able to access the system. You can reactivate them later if needed.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowBulkDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bulkLoading ? 'Deactivating...' : 'Deactivate Partners'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Status Change Modal */}
        {showBulkStatusModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Change Status for {selectedPartners.size} Partner{selectedPartners.size !== 1 ? 's' : ''}</h3>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value as Partner['status'])}
                    className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    {PARTNER_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowBulkStatusModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkStatusChange}
                    disabled={bulkLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bulkLoading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Permanent Delete Confirmation Modal */}
        {showBulkPermanentDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-900 mb-4">Confirm Bulk Permanent Delete</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete {selectedPartners.size} selected partner{selectedPartners.size !== 1 ? 's' : ''} permanently? This action cannot be undone.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> This will permanently delete the partners and their data from the system.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowBulkPermanentDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkPermanentDelete}
                    disabled={bulkLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bulkLoading ? 'Deleting...' : 'Delete Permanently'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}
