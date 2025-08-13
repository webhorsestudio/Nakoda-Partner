"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheckIcon,
  LockClosedIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function LoginSettingsPage() {
  const [isClient, setIsClient] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during hydration
  if (!isClient) {
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

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Login Settings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Configure authentication settings, security policies, and login page customization
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            suppressHydrationWarning
          >
            <ShieldCheckIcon className="h-4 w-4 mr-2" />
            Save All Settings
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {/* Authentication Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <LockClosedIcon className="h-5 w-5 mr-2" />
              Authentication Settings
            </h3>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Password Length</label>
                <input
                  type="number"
                  defaultValue="8"
                  min="6"
                  max="20"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  suppressHydrationWarning
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 6, Maximum 20 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password Expiry (days)</label>
                <input
                  type="number"
                  defaultValue="90"
                  min="30"
                  max="365"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  suppressHydrationWarning
                />
                <p className="mt-1 text-xs text-gray-500">Days before password expires</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lockout After (attempts)</label>
                <input
                  type="number"
                  defaultValue="5"
                  min="3"
                  max="10"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  suppressHydrationWarning
                />
                <p className="mt-1 text-xs text-gray-500">Failed login attempts before lockout</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lockout Duration (minutes)</label>
                <input
                  type="number"
                  defaultValue="15"
                  min="5"
                  max="60"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  suppressHydrationWarning
                />
                <p className="mt-1 text-xs text-gray-500">Minutes of account lockout</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Require Uppercase Letters</h4>
                  <p className="text-sm text-gray-500">Password must contain uppercase letters</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  suppressHydrationWarning
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Require Numbers</h4>
                  <p className="text-sm text-gray-500">Password must contain numbers</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  suppressHydrationWarning
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Require Special Characters</h4>
                  <p className="text-sm text-gray-500">Password must contain special characters</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  suppressHydrationWarning
                />
              </div>
            </div>
          </div>
        </div>

        {/* Session Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Session Management
            </h3>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                <input
                  type="number"
                  defaultValue="30"
                  min="5"
                  max="120"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  suppressHydrationWarning
                />
                <p className="mt-1 text-xs text-gray-500">Inactive session timeout</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Remember Me Duration (days)</label>
                <input
                  type="number"
                  defaultValue="30"
                  min="1"
                  max="90"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  suppressHydrationWarning
                />
                <p className="mt-1 text-xs text-gray-500">Days to remember login</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Enable Remember Me</h4>
                  <p className="text-sm text-gray-500">Allow users to stay logged in</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  suppressHydrationWarning
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Force Logout on Password Change</h4>
                  <p className="text-sm text-gray-500">Logout all sessions when password is changed</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  suppressHydrationWarning
                />
              </div>
            </div>
          </div>
        </div>

        {/* Login Page Customization */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Login Page Customization
            </h3>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Page Title</label>
                <input
                  type="text"
                  defaultValue="Nakoda Partner Admin"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Welcome Message</label>
                <input
                  type="text"
                  defaultValue="Welcome Back"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  suppressHydrationWarning
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Page Description</label>
              <textarea
                rows={3}
                defaultValue="Enter your mobile number to receive a secure OTP for authentication"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                suppressHydrationWarning
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Show Logo</h4>
                  <p className="text-sm text-gray-500">Display platform logo on login page</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  suppressHydrationWarning
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Show Footer</h4>
                  <p className="text-sm text-gray-500">Display copyright and links in footer</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  suppressHydrationWarning
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              Security Features
            </h3>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  suppressHydrationWarning
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Login Notifications</h4>
                  <p className="text-sm text-gray-500">Send email notifications for new logins</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  suppressHydrationWarning
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Failed Login Alerts</h4>
                  <p className="text-sm text-gray-500">Alert admins of failed login attempts</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  suppressHydrationWarning
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">IP Whitelist</h4>
                  <p className="text-sm text-gray-500">Restrict login to specific IP addresses</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  suppressHydrationWarning
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            suppressHydrationWarning
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            suppressHydrationWarning
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
}
