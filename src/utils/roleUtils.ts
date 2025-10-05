// Role and Permission Utilities for Existing Database Structure
// This works with your existing admin_users and partners tables

export interface UserRole {
  role: 'admin' | 'partner' | 'customer' | 'Admin' | 'Super Admin' | 'Support Admin' | 'Analytics Admin' | 'Technical Admin';
  permissions: string[];
  access_level?: string;
  source_table: 'admin_users' | 'partners';
}

// Navigation item interface with support for sub-menus
export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  alwaysShow: boolean;
  children?: NavigationItem[];
}

// Navigation item interface with support for sub-menus
export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  alwaysShow: boolean;
  children?: NavigationItem[];
}

// Check user role from mobile number (since we use mobile for OTP login)
export async function getUserRole(mobile: string): Promise<UserRole | null> {
  try {
    console.log('🔍 Checking role for mobile:', mobile);
    
    // Get authentication token from localStorage
    const token = localStorage.getItem('auth-token');
    if (!token) {
      console.log('❌ No auth token found for role check');
      return null;
    }
    
    // First check admin_users table
    try {
      const adminResponse: Response = await Promise.race([
        fetch(`/api/users/check-role?mobile=${encodeURIComponent(mobile)}&table=admin_users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)) as unknown as Promise<Response>
      ]);
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        if (adminData.success && adminData.data) {
          console.log('✅ Admin user found:', adminData.data);
          return {
            role: adminData.data.role || 'admin', // Use actual role from database
            permissions: adminData.data.permissions || [],
            access_level: adminData.data.access_level,
            source_table: 'admin_users'
          };
        }
      }
    } catch (adminError) {
      console.warn('Error checking admin_users table:', adminError);
    }

    // Then check partners table
    try {
      const partnerResponse: Response = await Promise.race([
        fetch(`/api/users/check-role?mobile=${encodeURIComponent(mobile)}&table=partners`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)) as unknown as Promise<Response>
      ]);
      if (partnerResponse.ok) {
        const partnerData = await partnerResponse.json();
        if (partnerData.success && partnerData.data) {
          console.log('✅ Partner user found:', partnerData.data);
          return {
            role: 'partner',
            permissions: ['View Orders', 'Update Profile', 'View Earnings', 'Manage Services'],
            access_level: 'Partner Access',
            source_table: 'partners'
          };
        }
      }
    } catch (partnerError) {
      console.warn('Error checking partners table:', partnerError);
    }

    console.log('❌ No user found for mobile:', mobile);
    // Default to customer if not found
    return {
      role: 'customer',
      permissions: ['View Orders', 'Update Profile', 'Place Orders'],
      access_level: 'Customer Access',
      source_table: 'partners' // Default source
    };
  } catch (error) {
    console.error('Error checking user role:', error);
    // Return a default admin role on error to prevent crashes
    return {
      role: 'admin',
      permissions: ['Full Access'],
      access_level: 'Full Access',
      source_table: 'admin_users'
    };
  }
}

// Check if user has specific permission
export function hasPermission(userRole: UserRole | null, requiredPermission: string): boolean {
  if (!userRole) return false;
  
  // Admin has all permissions
  if (userRole.role === 'admin') {
    return true;
  }
  
  // Check specific permission
  return userRole.permissions.includes(requiredPermission);
}

// Check if user can access admin panel
export function canAccessAdminPanel(userRole: UserRole | null): boolean {
  if (!userRole) return false;
  
  // Check for all admin role variations
  const adminRoles = ['admin', 'Admin', 'Super Admin', 'Support Admin', 'Analytics Admin', 'Technical Admin'];
  return adminRoles.includes(userRole.role);
}

// Check if user can access partners section
export function canAccessPartners(userRole: UserRole | null): boolean {
  return canAccessAdminPanel(userRole) || 
         hasPermission(userRole, 'Partner Management');
}

// Check if user can access orders section
export function canAccessOrders(userRole: UserRole | null): boolean {
  return canAccessAdminPanel(userRole) || 
         hasPermission(userRole, 'Order Management') ||
         hasPermission(userRole, 'View Orders');
}

// Check if user can access customers section
export function canAccessCustomers(userRole: UserRole | null): boolean {
  return canAccessAdminPanel(userRole) || 
         hasPermission(userRole, 'User Management');
}

// Check if user can access settings section
export function canAccessSettings(userRole: UserRole | null): boolean {
  return canAccessAdminPanel(userRole) || 
         hasPermission(userRole, 'System Settings');
}

// Get navigation items based on user role
export function getNavigationItems(userRole: UserRole | null): NavigationItem[] {
  const baseItems: NavigationItem[] = [
    { name: "Dashboard", href: "/admin", icon: "HomeIcon", alwaysShow: true }
  ];

  if (canAccessOrders(userRole)) {
    baseItems.push({
      name: "Orders",
      href: "/admin/orders/details",
      icon: "CalendarIcon",
      alwaysShow: false,
      children: [
        { name: "Order Management", href: "/admin/orders/details", icon: "CalendarIcon", alwaysShow: false }
      ]
    });
  }

  if (canAccessCustomers(userRole)) {
    baseItems.push({ name: "Customers", href: "/admin/customers", icon: "UsersIcon", alwaysShow: false });
  }

  if (canAccessPartners(userRole)) {
    baseItems.push({
      name: "Partners",
      href: "/admin/partners",
      icon: "UserGroupIcon",
      alwaysShow: false,
      children: [
        { name: "Partners Details", href: "/admin/partners", icon: "UserGroupIcon", alwaysShow: false },
        { name: "Partner Wallet", href: "/admin/partners/wallet", icon: "CurrencyDollarIcon", alwaysShow: false },
        { name: "Services Details", href: "/admin/partners/services", icon: "WrenchScrewdriverIcon", alwaysShow: false }
      ]
    });
  }

  // Always show these for now
  baseItems.push(
    { name: "Nakoda Team", href: "/admin/team", icon: "UserGroupIcon", alwaysShow: false },
    { name: "Earnings", href: "/admin/earnings", icon: "CurrencyDollarIcon", alwaysShow: false },
    { name: "Analytics", href: "/admin/analytics", icon: "ChartBarIcon", alwaysShow: false }
  );

  if (canAccessSettings(userRole)) {
    baseItems.push({ 
      name: "Settings", 
      href: "/admin/settings", 
      icon: "CogIcon", 
      alwaysShow: false,
      children: [
        { name: "General Settings", href: "/admin/settings", icon: "CogIcon", alwaysShow: false },
        { name: "Partner Slider", href: "/admin/settings/partner-slider", icon: "PhotoIcon", alwaysShow: false }
      ]
    });
  }

  return baseItems;
}
