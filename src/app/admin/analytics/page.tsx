"use client";

import { useState } from "react";
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon,
  StarIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("month");

  const platformPerformance = [
    { name: "Jan", totalOrders: 1250, totalRevenue: 45000, activePartners: 45, avgRating: 4.6 },
    { name: "Feb", totalOrders: 1380, totalRevenue: 52000, activePartners: 52, avgRating: 4.7 },
    { name: "Mar", totalOrders: 1520, totalRevenue: 58000, activePartners: 58, avgRating: 4.8 },
    { name: "Apr", totalOrders: 1480, totalRevenue: 56000, activePartners: 61, avgRating: 4.7 },
    { name: "May", totalOrders: 1650, totalRevenue: 62000, activePartners: 67, avgRating: 4.8 },
    { name: "Jun", totalOrders: 1580, totalRevenue: 59000, activePartners: 63, avgRating: 4.9 },
  ];

  const partnerPerformance = [
    { name: "Electrical", partners: 25, avgOrders: 45, avgRevenue: 1800, avgRating: 4.8 },
    { name: "Cleaning", partners: 18, avgOrders: 32, avgRevenue: 960, avgRating: 4.6 },
    { name: "Plumbing", partners: 15, avgOrders: 28, avgRevenue: 840, avgRating: 4.7 },
    { name: "HVAC", partners: 12, avgOrders: 22, avgRevenue: 1200, avgRating: 4.5 },
    { name: "Landscaping", partners: 8, avgOrders: 15, avgRevenue: 600, avgRating: 4.4 },
  ];

  const partnerSegments = [
    { name: "Active", value: 65, color: "#10B981" },
    { name: "Pending", value: 20, color: "#F59E0B" },
    { name: "Suspended", value: 10, color: "#EF4444" },
    { name: "Inactive", value: 5, color: "#6B7280" },
  ];

  const topPerformingPartners = [
    { name: "Elite Electrical Services", service: "Electrical", orders: 156, revenue: "$12,450", rating: 4.8, location: "NY" },
    { name: "PlumbRight Solutions", service: "Plumbing", orders: 203, revenue: "$18,750", rating: 4.6, location: "IL" },
    { name: "CleanPro Housekeeping", service: "Cleaning", orders: 89, revenue: "$8,920", rating: 4.9, location: "CA" },
    { name: "CoolBreeze HVAC", service: "HVAC", orders: 134, revenue: "$11,200", rating: 4.5, location: "FL" },
    { name: "GreenThumb Landscaping", service: "Landscaping", orders: 67, revenue: "$6,340", rating: 4.7, location: "WA" },
  ];

  const regionalPerformance = [
    { region: "Northeast", partners: 25, orders: 580, revenue: 22000, avgRating: 4.7 },
    { region: "West", partners: 18, orders: 420, revenue: 16800, avgRating: 4.8 },
    { region: "Midwest", partners: 15, orders: 380, revenue: 15200, avgRating: 4.6 },
    { region: "South", partners: 12, orders: 320, revenue: 12800, avgRating: 4.5 },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Comprehensive insights into Nakoda platform performance and partner ecosystem
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Platform Overview Metrics */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Platform Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">8,860</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Platform Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">$332,000</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Partners</dt>
                  <dd className="text-lg font-medium text-gray-900">78</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Platform Rating</dt>
                  <dd className="text-lg font-medium text-gray-900">4.8</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Satisfaction, Platform Growth, Service Distribution */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Partner Satisfaction */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Partner Satisfaction</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overall Rating</span>
              <span className="text-lg font-semibold text-gray-900">4.8/5.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-lg font-semibold text-gray-900">2.3 hrs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Support Quality</span>
              <span className="text-lg font-semibold text-gray-900">4.9/5.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Platform Ease</span>
              <span className="text-lg font-semibold text-gray-900">4.7/5.0</span>
            </div>
          </div>
        </div>

        {/* Platform Growth */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Growth</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Partners</span>
              <span className="text-lg font-semibold text-green-600">+12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Order Growth</span>
              <span className="text-lg font-semibold text-green-600">+18%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Revenue Growth</span>
              <span className="text-lg font-semibold text-green-600">+22%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Customer Growth</span>
              <span className="text-lg font-semibold text-green-600">+15%</span>
            </div>
          </div>
        </div>

        {/* Service Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Service Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Electrical</span>
              <span className="text-lg font-semibold text-gray-900">32%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cleaning</span>
              <span className="text-lg font-semibold text-gray-900">28%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Plumbing</span>
              <span className="text-lg font-semibold text-gray-900">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">HVAC</span>
              <span className="text-lg font-semibold text-gray-900">15%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Other</span>
              <span className="text-lg font-semibold text-gray-900">5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Platform Performance Trend */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={platformPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalOrders" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="totalRevenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Partner Performance by Service */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Partner Performance by Service</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={partnerPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgOrders" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Performance */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Regional Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionalPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performing Partners */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Top Performing Partners</h3>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {topPerformingPartners.map((partner, index) => (
                <li key={index} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserGroupIcon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {partner.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500 truncate">
                          {partner.service}
                        </p>
                        <span className="text-sm text-gray-400">•</span>
                        <p className="text-sm text-gray-500 truncate">
                          {partner.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{partner.revenue}</span>
                        <span className="text-sm text-gray-500">({partner.orders} orders)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-gray-600">{partner.rating}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
