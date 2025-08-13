export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  accessLevel: string;
  lastLogin: string;
  permissions: string[];
  avatar: string;
}

export interface TeamStats {
  totalAdmins: number;
  activeAdmins: number;
  superAdmins: number;
  accessLevels: number;
}
