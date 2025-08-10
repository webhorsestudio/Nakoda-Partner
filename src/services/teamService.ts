import { AdminUser, TeamStats } from "@/types/team";

export const getAdminUsers = (): AdminUser[] => {
  return [
    {
      id: 1,
      name: "John Admin",
      email: "john.admin@nakoda.com",
      phone: "+91 9876543210",
      role: "Super Admin",
      status: "Active",
      accessLevel: "Full Access",
      lastLogin: "2024-01-15 10:30 AM",
      permissions: ["Full Access", "User Management", "System Settings", "Partner Management"],
      avatar: "JA"
    },
    {
      id: 2,
      name: "Sarah Manager",
      email: "sarah.manager@nakoda.com",
      phone: "+91 9876543211",
      role: "Admin",
      status: "Active",
      accessLevel: "Limited Access",
      lastLogin: "2024-01-15 09:15 AM",
      permissions: ["User Management", "Partner Management", "Order Management"],
      avatar: "SM"
    },
    {
      id: 3,
      name: "Mike Support",
      email: "mike.support@nakoda.com",
      phone: "+91 9876543212",
      role: "Support Admin",
      status: "Active",
      accessLevel: "Support Access",
      lastLogin: "2024-01-15 08:45 AM",
      permissions: ["Order Management", "Customer Support", "Basic Reports"],
      avatar: "MS"
    },
    {
      id: 4,
      name: "Lisa Analyst",
      email: "lisa.analyst@nakoda.com",
      phone: "+91 9876543213",
      role: "Analytics Admin",
      status: "Active",
      accessLevel: "Analytics Access",
      lastLogin: "2024-01-14 11:20 AM",
      permissions: ["Analytics", "Reports", "Data Access"],
      avatar: "LA"
    },
    {
      id: 5,
      name: "David Tech",
      email: "david.tech@nakoda.com",
      phone: "+91 9876543214",
      role: "Technical Admin",
      status: "Inactive",
      accessLevel: "Technical Access",
      lastLogin: "2024-01-10 03:30 PM",
      permissions: ["System Settings", "API Management", "Technical Support"],
      avatar: "DT"
    }
  ];
};

export const getTeamStats = (adminUsers: AdminUser[]): TeamStats => {
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

export const filterAdminUsers = (
  adminUsers: AdminUser[],
  searchTerm: string,
  roleFilter: string
): AdminUser[] => {
  return adminUsers.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });
};
