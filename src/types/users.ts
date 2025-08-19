// User Management Types for 3-Role System (Admin, Partner, Customer)

// Base user interface
export interface BaseUser {
  id: number;
  email: string;
  phone: string;
  role: 'admin' | 'partner' | 'customer';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  first_name?: string;
  last_name?: string;
  avatar?: string;
  role_data?: Record<string, unknown>;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  last_login?: string;
  login_attempts: number;
  locked_until?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Admin user interface
export interface AdminUser extends BaseUser {
  role: 'admin';
  admin_profile: AdminProfile;
}

export interface AdminProfile {
  id: number;
  user_id: number;
  access_level: 'Full Access' | 'Limited Access' | 'Support Access' | 'Analytics Access' | 'Technical Access';
  permissions: string[];
  department?: string;
  supervisor_id?: number;
  created_at: string;
  updated_at: string;
}

// Partner user interface
export interface PartnerUser extends BaseUser {
  role: 'partner';
  partner_profile: PartnerProfile;
}

export interface PartnerProfile {
  id: number;
  user_id: number;
  service_type: string;
  rating: number;
  total_orders: number;
  total_revenue: number;
  location?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  address?: string;
  commission_percentage: number;
  joined_date: string;
  last_active?: string;
  verification_status: 'Pending' | 'Verified' | 'Rejected';
  documents_verified: boolean;
  notes?: string;
  business_name?: string;
  business_license?: string;
  tax_id?: string;
  bank_account_details?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Customer user interface
export interface CustomerUser extends BaseUser {
  role: 'customer';
  customer_profile: CustomerProfile;
}

export interface CustomerProfile {
  id: number;
  user_id: number;
  address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  preferences?: Record<string, unknown>;
  loyalty_points: number;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

// Union type for all user types
export type User = AdminUser | PartnerUser | CustomerUser;

// User creation interfaces
export interface CreateUserRequest {
  email: string;
  phone: string;
  role: 'admin' | 'partner' | 'customer';
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

export interface CreateAdminRequest extends CreateUserRequest {
  role: 'admin';
  access_level: AdminProfile['access_level'];
  permissions: string[];
  department?: string;
  supervisor_id?: number;
}

export interface CreatePartnerRequest extends CreateUserRequest {
  role: 'partner';
  service_type: string;
  business_name?: string;
  location?: string;
  city?: string;
  state?: string;
  commission_percentage?: number;
}

export interface CreateCustomerRequest extends CreateUserRequest {
  role: 'customer';
  address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
}

// User update interfaces
export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  avatar?: string;
  status?: BaseUser['status'];
  email_verified?: boolean;
  phone_verified?: boolean;
}

export interface UpdateAdminRequest extends UpdateUserRequest {
  access_level?: AdminProfile['access_level'];
  permissions?: string[];
  department?: string;
  supervisor_id?: number;
}

export interface UpdatePartnerRequest extends UpdateUserRequest {
  service_type?: string;
  rating?: number;
  location?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  address?: string;
  commission_percentage?: number;
  verification_status?: PartnerProfile['verification_status'];
  documents_verified?: boolean;
  notes?: string;
  business_name?: string;
}

export interface UpdateCustomerRequest extends UpdateUserRequest {
  address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  preferences?: Record<string, unknown>;
}

// User response interfaces
export interface UserResponse {
  success: boolean;
  data?: User | User[];
  total?: number;
  error?: string;
  details?: string;
}

// User filters for search and pagination
export interface UserFilters {
  role?: 'admin' | 'partner' | 'customer';
  status?: BaseUser['status'];
  search?: string;
  department?: string;
  service_type?: string;
  verification_status?: PartnerProfile['verification_status'];
  page?: number;
  limit?: number;
}

// Permission constants
export const ADMIN_PERMISSIONS = [
  'Full Access',
  'User Management',
  'Partner Management',
  'Order Management',
  'Customer Management',
  'System Settings',
  'Analytics',
  'Reports',
  'Financial',
  'API Management',
  'Technical Support'
] as const;

export const PARTNER_PERMISSIONS = [
  'View Orders',
  'Update Profile',
  'View Earnings',
  'Manage Services',
  'View Analytics'
] as const;

export const CUSTOMER_PERMISSIONS = [
  'View Orders',
  'Update Profile',
  'Place Orders',
  'View History',
  'Manage Preferences'
] as const;

// Role-based access levels
export const ROLE_ACCESS_LEVELS = {
  admin: {
    'Super Admin': 'Full Access',
    'Admin': 'Limited Access',
    'Support Admin': 'Support Access',
    'Analytics Admin': 'Analytics Access',
    'Technical Admin': 'Technical Access'
  },
  partner: {
    'Verified Partner': 'Full Partner Access',
    'Pending Partner': 'Limited Partner Access',
    'Suspended Partner': 'No Access'
  },
  customer: {
    'Active Customer': 'Full Customer Access',
    'Inactive Customer': 'Limited Customer Access',
    'Suspended Customer': 'No Access'
  }
} as const;
