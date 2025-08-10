import { useState, useEffect } from 'react';
import { AdminUser } from '@/types/team';
import { 
  getAdminUsers, 
  createAdminUser, 
  updateAdminUser, 
  deleteAdminUser,
  CreateAdminUserData,
  UpdateAdminUserData
} from '@/services/adminUserService';

export const useAdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all admin users
  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await getAdminUsers();
      setAdminUsers(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin users');
    } finally {
      setLoading(false);
    }
  };

  // Create a new admin user
  const addAdminUser = async (userData: CreateAdminUserData) => {
    try {
      setError(null);
      const newUser = await createAdminUser(userData);
      if (newUser) {
        setAdminUsers(prev => [newUser, ...prev]);
        return newUser;
      }
      throw new Error('Failed to create admin user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin user');
      throw err;
    }
  };

  // Update an admin user
  const updateUser = async (id: number, userData: UpdateAdminUserData) => {
    try {
      setError(null);
      const updatedUser = await updateAdminUser(id, userData);
      if (updatedUser) {
        setAdminUsers(prev => 
          prev.map(user => user.id === id ? updatedUser : user)
        );
        return updatedUser;
      }
      throw new Error('Failed to update admin user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update admin user');
      throw err;
    }
  };

  // Delete an admin user
  const removeAdminUser = async (id: number) => {
    try {
      setError(null);
      const success = await deleteAdminUser(id);
      if (success) {
        setAdminUsers(prev => prev.filter(user => user.id !== id));
        return true;
      }
      throw new Error('Failed to delete admin user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete admin user');
      throw err;
    }
  };

  // Filter admin users
  const filterUsers = (searchTerm: string, roleFilter: string) => {
    return adminUsers.filter(admin => {
      const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           admin.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || admin.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  };

  // Get team stats
  const getTeamStats = () => {
    const totalAdmins = adminUsers.length;
    const activeAdmins = adminUsers.filter(admin => admin.status === "Active").length;
    const superAdmins = adminUsers.filter(admin => admin.role === "Super Admin").length;
    const accessLevels = [...new Set(adminUsers.map(admin => admin.accessLevel))].length;

    return {
      totalAdmins,
      activeAdmins,
      superAdmins,
      accessLevels
    };
  };

  // Initialize data
  useEffect(() => {
    fetchAdminUsers();
  }, []);

  return {
    adminUsers,
    loading,
    error,
    fetchAdminUsers,
    addAdminUser,
    updateUser,
    removeAdminUser,
    filterUsers,
    getTeamStats
  };
};
