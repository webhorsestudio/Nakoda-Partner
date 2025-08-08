"use client";

import { useState, useEffect } from "react";
import { 
  CogIcon,
  KeyIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isClient, setIsClient] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const tabs = [
    { id: "general", name: "General", icon: CogIcon },
    { id: "email", name: "Email Settings", icon: EnvelopeIcon },
    { id: "sms", name: "SMS Settings", icon: ChatBubbleLeftRightIcon },
    { id: "api", name: "API & Integrations", icon: KeyIcon },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage platform-wide settings, configurations, and system preferences
          </p>
        </div>
      </div>

      <div className="mt-8">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                suppressHydrationWarning
              >
                <tab.icon className="h-5 w-5 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Platform Name</label>
                    <input
                      type="text"
                      defaultValue="Nakoda Partner Platform"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Platform Version</label>
                    <input
                      type="text"
                      defaultValue="v2.1.0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                    <input
                      type="email"
                      defaultValue="admin@nakoda.com"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Support Phone</label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" suppressHydrationWarning>
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Database Status</h4>
                      <p className="text-sm text-gray-500">PostgreSQL connection</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">API Status</h4>
                      <p className="text-sm text-gray-500">REST API endpoints</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Service</h4>
                      <p className="text-sm text-gray-500">SMTP configuration</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Payment Gateway</h4>
                      <p className="text-sm text-gray-500">Stripe integration</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SMTP Configuration</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
                    <input
                      type="text"
                      defaultValue="smtp.gmail.com"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
                    <input
                      type="number"
                      defaultValue="587"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Username</label>
                    <input
                      type="email"
                      defaultValue="noreply@nakoda.com"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Password</label>
                    <input
                      type="password"
                      defaultValue="••••••••"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" suppressHydrationWarning>
                    Test Connection
                  </button>
                  <button className="ml-3 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700" suppressHydrationWarning>
                    Save Configuration
                  </button>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Email Templates</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Welcome Email</h4>
                      <p className="text-sm text-gray-500">Sent to new partners</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium" suppressHydrationWarning>
                      Edit Template
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Order Confirmation</h4>
                      <p className="text-sm text-gray-500">Sent to customers</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium" suppressHydrationWarning>
                      Edit Template
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Password Reset</h4>
                      <p className="text-sm text-gray-500">Security emails</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium" suppressHydrationWarning>
                      Edit Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sms" && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">FAST2SMS API Configuration</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">API Key</label>
                    <input
                      type="text"
                      defaultValue="CYZAqVtcxfOL8RNWkSK6EmJ5ov9Pped7wGXQUIbasFuyhrj3B4YPHwGOT9NFSLht0kDyfrq82QACjloI"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                    <p className="mt-1 text-xs text-gray-500">Your Fast2SMS API authorization key</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sender ID</label>
                    <input
                      type="text"
                      defaultValue="NuServ"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                    <p className="mt-1 text-xs text-gray-500">6-character sender ID (e.g., NuServ)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message Template ID</label>
                    <input
                      type="text"
                      defaultValue="160562"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                    <p className="mt-1 text-xs text-gray-500">DLT template ID for OTP messages</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Route Type</label>
                    <select
                      defaultValue="dlt"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    >
                      <option value="dlt">DLT (Promotional)</option>
                      <option value="otp">OTP (Transactional)</option>
                      <option value="q">Quick (Promotional)</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">SMS route type for message delivery</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" suppressHydrationWarning>
                    Test SMS
                  </button>
                  <button className="ml-3 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700" suppressHydrationWarning>
                    Save Configuration
                  </button>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">OTP Messages</h4>
                      <p className="text-sm text-gray-500">Login verification SMS</p>
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
                      <h4 className="text-sm font-medium text-gray-900">Order Notifications</h4>
                      <p className="text-sm text-gray-500">Order status updates</p>
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
                      <h4 className="text-sm font-medium text-gray-900">Partner Alerts</h4>
                      <p className="text-sm text-gray-500">New order notifications</p>
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
                      <h4 className="text-sm font-medium text-gray-900">Marketing SMS</h4>
                      <p className="text-sm text-gray-500">Promotional messages</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      suppressHydrationWarning
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" suppressHydrationWarning>
                    Test All Services
                  </button>
                  <button className="ml-3 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700" suppressHydrationWarning>
                    Save Settings
                  </button>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Analytics</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">1,247</div>
                    <div className="text-sm text-blue-600">Messages Sent</div>
                    <div className="text-xs text-blue-500">This month</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">98.5%</div>
                    <div className="text-sm text-green-600">Delivery Rate</div>
                    <div className="text-xs text-green-500">Success rate</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">₹2,450</div>
                    <div className="text-sm text-purple-600">SMS Credits</div>
                    <div className="text-xs text-purple-500">Available balance</div>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium" suppressHydrationWarning>
                    View Detailed Analytics →
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">API Credentials</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">API Key</label>
                    <input
                      type="text"
                      defaultValue="nak_platform_••••••••••••••••••••••••••••••••"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">API Secret</label>
                    <input
                      type="password"
                      defaultValue="••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
                    <input
                      type="url"
                      defaultValue="https://api.nakoda.com/webhooks"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rate Limit</label>
                    <input
                      type="number"
                      defaultValue="1000"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      suppressHydrationWarning
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" suppressHydrationWarning>
                    Regenerate Keys
                  </button>
                  <button className="ml-3 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700" suppressHydrationWarning>
                    Save Credentials
                  </button>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Webhook Configuration</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Order Created</h4>
                      <p className="text-sm text-gray-500">Notify when new orders are placed</p>
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
                      <h4 className="text-sm font-medium text-gray-900">Order Completed</h4>
                      <p className="text-sm text-gray-500">Notify when orders are finished</p>
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
                      <h4 className="text-sm font-medium text-gray-900">Partner Registered</h4>
                      <p className="text-sm text-gray-500">Notify when new partners join</p>
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
                      <h4 className="text-sm font-medium text-gray-900">Payment Processed</h4>
                      <p className="text-sm text-gray-500">Notify when payments are completed</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      suppressHydrationWarning
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" suppressHydrationWarning>
                    Test Webhooks
                  </button>
                  <button className="ml-3 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700" suppressHydrationWarning>
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
