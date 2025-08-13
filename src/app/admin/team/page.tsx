"use client";

import { useState, useEffect } from "react";
import { 
  TeamHeader,
  SearchAndFilter,
  TeamStats,
  AdminUsersTable,
  LoadingSkeleton,
  AdminUserModal
} from "@/components/team";
import { ConfirmDialog } from "@/components/ui";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { notificationService } from "@/services/notificationService";
import { AdminUser } from "@/types/team";
import { CreateAdminUserData, UpdateAdminUserData } from "@/services/adminUserService";

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isClient, setIsClient] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  const {
    adminUsers,
    loading,
    error,
    addAdminUser,
    updateUser,
    removeAdminUser,
    filterUsers,
    getTeamStats
  } = useAdminUsers();

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredAdminUsers = filterUsers(searchTerm, roleFilter);
  const stats = getTeamStats();

  const handleAddAdmin = () => {
    setModalMode('create');
    setSelectedAdmin(null);
    setIsModalOpen(true);
  };

  const handleViewAdmin = (admin: AdminUser) => {
    notificationService.info(`Viewing details for ${admin.name}`);
    
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setModalMode('edit');
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleDeleteAdmin = (admin: AdminUser) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Admin User",
      message: `Are you sure you want to delete ${admin.name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await removeAdminUser(admin.id);
          notificationService.success(`Admin user ${admin.name} deleted successfully`);
        } catch (error) {
          notificationService.error(`Failed to delete admin user ${admin.name}`);
        }
      },
    });
  };

  const handleModalSubmit = async (data: CreateAdminUserData | UpdateAdminUserData) => {
    try {
      if (modalMode === 'create') {
        await addAdminUser(data as CreateAdminUserData);
        notificationService.success('Admin user created successfully');
      } else {
        if (selectedAdmin) {
          await updateUser(selectedAdmin.id, data as UpdateAdminUserData);
          notificationService.success('Admin user updated successfully');
        }
      }
    } catch (error) {
      const action = modalMode === 'create' ? 'create' : 'update';
      notificationService.error(`Failed to ${action} admin user`);
      throw error;
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
  };

  const handleConfirmClose = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Show loading state during hydration
  if (!isClient) {
    return <LoadingSkeleton />;
  }

  // Show loading state while fetching data
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <TeamHeader onAddAdmin={handleAddAdmin} />
      
      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      <TeamStats
        totalAdmins={stats.totalAdmins}
        activeAdmins={stats.activeAdmins}
        superAdmins={stats.superAdmins}
        accessLevels={stats.accessLevels}
      />

      <AdminUsersTable
        adminUsers={filteredAdminUsers}
        onView={handleViewAdmin}
        onEdit={handleEditAdmin}
        onDelete={handleDeleteAdmin}
      />

      <AdminUserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        adminUser={selectedAdmin}
        mode={modalMode}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleConfirmClose}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
