import { supabase } from '@/lib/supabase';
import { AdminUser } from '@/types/team';

export interface CreateAdminUserData {
  name: string;
  email: string;
  phone: string;
  role: string;
  access_level: string;
  permissions: string[];
  avatar: string;
}

export interface UpdateAdminUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: 'Active' | 'Inactive';
  access_level?: string;
  permissions?: string[];
  avatar?: string;
}

// Get all admin users
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }

    // Transform database format to our interface
    return data?.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      accessLevel: user.access_level,
      lastLogin: user.last_login,
      permissions: user.permissions,
      avatar: user.avatar
    })) || [];
  } catch (error) {
    console.error('Error in getAdminUsers:', error);
    return [];
  }
};

// Create a new admin user
export const createAdminUser = async (userData: CreateAdminUserData): Promise<AdminUser | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([{
        ...userData,
        status: 'Active',
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }

    // Transform database format to our interface
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      status: data.status,
      accessLevel: data.access_level,
      lastLogin: data.last_login,
      permissions: data.permissions,
      avatar: data.avatar
    };
  } catch (error) {
    console.error('Error in createAdminUser:', error);
    return null;
  }
};

// Update an admin user
export const updateAdminUser = async (id: number, userData: UpdateAdminUserData): Promise<AdminUser | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        ...userData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin user:', error);
      throw error;
    }

    // Transform database format to our interface
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      status: data.status,
      accessLevel: data.access_level,
      lastLogin: data.last_login,
      permissions: data.permissions,
      avatar: data.avatar
    };
  } catch (error) {
    console.error('Error in updateAdminUser:', error);
    return null;
  }
};

// Delete an admin user
export const deleteAdminUser = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting admin user:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAdminUser:', error);
    return false;
  }
};

// Get admin user by ID
export const getAdminUserById = async (id: number): Promise<AdminUser | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching admin user:', error);
      throw error;
    }

    // Transform database format to our interface
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      status: data.status,
      accessLevel: data.access_level,
      lastLogin: data.last_login,
      permissions: data.permissions,
      avatar: data.avatar
    };
  } catch (error) {
    console.error('Error in getAdminUserById:', error);
    return null;
  }
};
