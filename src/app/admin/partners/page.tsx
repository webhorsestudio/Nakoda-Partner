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
import { Partner, PartnerFormData, SERVICE_TYPES, PARTNER_STATUSES, VERIFICATION_STATUSES } from "@/types/partners";
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
    clearFilters
  } = usePartners(10);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

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
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => setShowAddPartner(true)}
              className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <PlusIcon className="h-4 w-4 inline mr-2" />
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
            {SERVICE_TYPES.map(service => (
              <option key={service} value={service}>{service}</option>
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
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                            {loading ? "Loading partners..." : "No partners found"}
                          </td>
                        </tr>
                      ) : (
                        partners.map((partner) => (
                          <tr key={partner.id}>
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
      </div>
    </Suspense>
  );
}
