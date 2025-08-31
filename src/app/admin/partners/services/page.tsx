"use client";

import { useState, useEffect, Suspense } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getUserRole, canAccessPartners, UserRole } from "@/utils/roleUtils";
import { Service, ServiceFormData } from "@/types/services";
import {
  ServicesHeader,
  ServicesSearchAndFilter,
  ServicesStats,
  ServicesTable,
  DeleteConfirmModal,
  ServiceFormModal
} from "@/components/services";

// Loading component for Suspense fallback
function ServicesLoadingSkeleton() {
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
      You don&apos;t have permission to access the Services section.
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

export default function ServicesPage() {
  const [isClient, setIsClient] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

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
              // Fetch services after permissions are confirmed
              fetchServices();
            } else {
              toast.error("You don't have permission to access Services");
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

  // Fetch services from the database
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setServices(data.data || []);
        } else {
          console.error('Invalid response format:', data);
          toast.error('Invalid response format from server');
        }
      } else {
        console.error('Failed to fetch services');
        toast.error('Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  // Filter services based on search
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Handle service form submission (add or edit)
  const handleServiceSubmit = async (formData: ServiceFormData) => {
    try {
      if (selectedService) {
        // Edit existing service
        const response = await fetch(`/api/services/${selectedService.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          toast.success("Service updated successfully");
          fetchServices(); // Refresh the list
        } else {
          toast.error(data.error || "Failed to update service");
        }
      } else {
        // Add new service
        const response = await fetch('/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          toast.success("Service created successfully");
          fetchServices(); // Refresh the list
        } else {
          toast.error(data.error || "Failed to create service");
        }
      }
      setShowServiceForm(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Error saving service');
    }
  };

  // Handle service deletion
  const handleDeleteService = async (id: number) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Service deleted successfully");
        fetchServices(); // Refresh the list
      } else {
        toast.error(data.error || "Failed to delete service");
      }
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Error deleting service');
    }
  };

  // Handle service status toggle
  const handleStatusToggle = async (id: number) => {
    try {
      const service = services.find(s => s.id === id);
      if (!service) return;

      const updatedData = { ...service, is_active: !service.is_active };
      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Service status updated successfully");
        fetchServices(); // Refresh the list
      } else {
        toast.error(data.error || "Failed to update service status");
      }
    } catch (error) {
      console.error('Error updating service status:', error);
      toast.error('Error updating service status');
    }
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
  };

  // Handle add service
  const handleAddService = () => {
    setSelectedService(null); // Ensure we're in add mode
    setShowServiceForm(true);
  };

  // Handle edit service
  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setShowServiceForm(true);
  };

  // Handle delete service
  const handleDeleteServiceClick = (id: number) => {
    setShowDeleteConfirm(id);
  };

  // Handle close service form
  const handleCloseServiceForm = () => {
    setShowServiceForm(false);
    setSelectedService(null);
  };

  // Show loading state during hydration
  if (!isClient) {
    return <ServicesLoadingSkeleton />;
  }

  // Show permission denied if user doesn't have access
  if (isClient && !permissionsLoading && userRole && !canAccessPartners(userRole)) {
    return <PermissionDenied />;
  }

  // Show loading while checking permissions or fetching data
  if (permissionsLoading || loading) {
    return <ServicesLoadingSkeleton />;
  }

  return (
    <Suspense fallback={<ServicesLoadingSkeleton />}>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ServicesHeader onAddService={handleAddService} />

        {/* Search and Filter */}
        <ServicesSearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onClearFilters={handleClearFilters}
        />

        {/* Service Stats */}
        <ServicesStats services={services} />

        {/* Services Table */}
        <ServicesTable
          services={filteredServices}
          onEdit={handleEditService}
          onDelete={handleDeleteServiceClick}
          onStatusToggle={handleStatusToggle}
        />

        {/* Modals */}
        <DeleteConfirmModal
          isOpen={showDeleteConfirm !== null}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => showDeleteConfirm && handleDeleteService(showDeleteConfirm)}
        />

        <ServiceFormModal
          isOpen={showServiceForm}
          onClose={handleCloseServiceForm}
          onSubmit={handleServiceSubmit}
          service={selectedService}
        />
      </div>
    </Suspense>
  );
}
