import { useState, useEffect } from 'react';
import { decodeUserPermissions, UserPermissions } from '@/utils/authUtils';
import { User, AdminUser, PartnerUser, CustomerUser } from '@/types/users';

export function usePermissions() {
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (token) {
          const permissions = decodeUserPermissions(token);
          setUserPermissions(permissions);
          
          // Also try to get current user info from token
          // This would typically come from a separate API call
          // For now, we'll use the permissions data
        } else {
          setUserPermissions(null);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setUserPermissions(null);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();

    // Listen for storage changes (e.g., when token is updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-token') {
        checkPermissions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const hasPermission = (requiredPermission: string): boolean => {
    if (!userPermissions) return false;
    
    // Super Admin has all permissions
    if (userPermissions.role === 'Super Admin' || userPermissions.access_level === 'Full Access') {
      return true;
    }
    
    // Check specific permission
    return userPermissions.permissions.includes(requiredPermission);
  };

  // Role-based permission checks
  const isAdmin = (): boolean => {
    return !!(userPermissions && (
      userPermissions.role === 'Super Admin' || 
      userPermissions.role === 'Admin' || 
      userPermissions.access_level === 'Full Access'
    ));
  };

  const isPartner = (): boolean => {
    return !!(userPermissions && (
      userPermissions.role === 'partner' || 
      userPermissions.permissions.includes('Partner Management')
    ));
  };

  const isCustomer = (): boolean => {
    return userPermissions?.role === 'customer' || false;
  };

  // Admin permissions
  const canAccessPartners = (): boolean => hasPermission('Partner Management');
  const canAccessOrders = (): boolean => hasPermission('Order Management');
  const canAccessUsers = (): boolean => hasPermission('User Management');
  const canAccessSettings = (): boolean => hasPermission('System Settings');
  const canAccessAnalytics = (): boolean => hasPermission('Analytics') || hasPermission('Reports');
  const canAccessEarnings = (): boolean => hasPermission('Financial') || hasPermission('Reports');
  const canAccessCustomers = (): boolean => hasPermission('Customer Management');

  // Partner permissions
  const canViewOwnOrders = (): boolean => isPartner();
  const canUpdateOwnProfile = (): boolean => isPartner();
  const canViewOwnEarnings = (): boolean => isPartner();
  const canManageServices = (): boolean => isPartner();

  // Customer permissions
  const canPlaceOrders = (): boolean => isCustomer();
  const canViewOrderHistory = (): boolean => isCustomer();
  const canUpdatePreferences = (): boolean => isCustomer();

  // Navigation permissions based on role
  const getNavigationPermissions = () => {
    if (isAdmin()) {
      return {
        dashboard: true,
        orders: canAccessOrders(),
        customers: canAccessCustomers(),
        partners: canAccessPartners(),
        team: canAccessUsers(),
        earnings: canAccessEarnings(),
        analytics: canAccessAnalytics(),
        settings: canAccessSettings()
      };
    } else if (isPartner()) {
      return {
        dashboard: true,
        orders: canViewOwnOrders(),
        profile: canUpdateOwnProfile(),
        earnings: canViewOwnEarnings(),
        services: canManageServices(),
        analytics: true // Basic analytics for partners
      };
    } else if (isCustomer()) {
      return {
        dashboard: true,
        orders: canPlaceOrders(),
        history: canViewOrderHistory(),
        profile: true,
        preferences: canUpdatePreferences()
      };
    }
    
    return {
      dashboard: false,
      orders: false,
      customers: false,
      partners: false,
      team: false,
      earnings: false,
      analytics: false,
      settings: false
    };
  };

  return {
    // User data
    userPermissions,
    currentUser,
    isLoading,
    
    // Role checks
    isAdmin,
    isPartner,
    isCustomer,
    
    // Permission checks
    hasPermission,
    
    // Admin permissions
    canAccessPartners,
    canAccessOrders,
    canAccessUsers,
    canAccessSettings,
    canAccessAnalytics,
    canAccessEarnings,
    canAccessCustomers,
    
    // Partner permissions
    canViewOwnOrders,
    canUpdateOwnProfile,
    canViewOwnEarnings,
    canManageServices,
    
    // Customer permissions
    canPlaceOrders,
    canViewOrderHistory,
    canUpdatePreferences,
    
    // Navigation permissions
    getNavigationPermissions,
    
    // User info
    role: userPermissions?.role || 'Unknown',
    accessLevel: userPermissions?.access_level || 'Unknown'
  };
}
