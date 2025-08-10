"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, UserPlusIcon, PencilIcon, UserIcon, EnvelopeIcon, PhoneIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { AdminUser } from "@/types/team";
import { CreateAdminUserData, UpdateAdminUserData } from "@/services/adminUserService";

interface AdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAdminUserData | UpdateAdminUserData) => Promise<void>;
  adminUser?: AdminUser | null;
  mode: 'create' | 'edit';
}

const ROLES = ["Admin"];

export default function AdminUserModal({
  isOpen,
  onClose,
  onSubmit,
  adminUser,
  mode
}: AdminUserModalProps) {
  const [formData, setFormData] = useState<CreateAdminUserData>({
    name: "",
    email: "",
    phone: "",
    role: "Admin",
    access_level: "Full Access",
    permissions: ["Full Access"],
    avatar: ""
  });
  const [loading, setLoading] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (adminUser && mode === 'edit') {
      setFormData({
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone,
        role: adminUser.role,
        access_level: adminUser.accessLevel,
        permissions: adminUser.permissions,
        avatar: adminUser.avatar
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "Admin",
        access_level: "Full Access",
        permissions: ["Full Access"],
        avatar: ""
      });
    }
  }, [adminUser, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      // Error is already handled by the parent component
      console.error('Modal submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAvatar = (name: string) => {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    setFormData(prev => ({ ...prev, avatar: initials }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-lg shadow-xl rounded-lg bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  {mode === 'create' ? (
                    <UserPlusIcon className="h-7 w-7 text-white" />
                  ) : (
                    <PencilIcon className="h-7 w-7 text-white" />
                  )}
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {mode === 'create' ? 'Add New Admin User' : 'Edit Admin User'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {mode === 'create' ? 'Create a new admin user with full access' : 'Update admin user details'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
              </div>
              
              <div className="space-y-5">
                {/* Full Name */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }));
                        if (e.target.value) {
                          generateAvatar(e.target.value);
                        }
                      }}
                      className="block w-full pl-10 pr-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 bg-white"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="block w-full pl-10 pr-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 bg-white"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="block w-full pl-10 pr-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 bg-white"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="block w-full pl-10 pr-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 bg-gray-50 text-gray-600"
                      disabled
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 flex items-center">
                    <ShieldCheckIcon className="h-3 w-3 mr-1" />
                    All admin users have full access to the system
                  </p>
                </div>

                {/* Avatar Preview */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Avatar Preview
                  </label>
                  <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold text-white">
                        {formData.avatar || "NA"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Auto-generated initials</p>
                      <p className="text-xs text-gray-500">Based on the full name entered above</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-lg flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    {mode === 'create' ? (
                      <>
                        <UserPlusIcon className="h-4 w-4 mr-2" />
                        Add User
                      </>
                    ) : (
                      <>
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Update User
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
