"use client";

import { useState } from "react";
import { 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserGroupIcon,
  StarIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function EarningsPage() {
  const [timeRange, setTimeRange] = useState("week");

  const platformEarningsData = [
    { name: "Mon", totalEarnings: 12400, totalOrders: 180, activePartners: 65 },
    { name: "Tue", totalEarnings: 15800, totalOrders: 220, activePartners: 68 },
    { name: "Wed", totalEarnings: 9800, totalOrders: 140, activePartners: 62 },
    { name: "Thu", totalEarnings: 22500, totalOrders: 320, activePartners: 70 },
    { name: "Fri", totalEarnings: 18900, totalOrders: 280, activePartners: 72 },
    { name: "Sat", totalEarnings: 26000, totalOrders: 380, activePartners: 75 },
    { name: "Sun", totalEarnings: 14500, totalOrders: 210, activePartners: 68 },
  ];

  const partnerEarningsBreakdown = [
    { name: "Electrical", value: 45, color: "#3B82F6" },
    { name: "Cleaning", value: 30, color: "#10B981" },
    { name: "Plumbing", value: 15, color: "#F59E0B" },
    { name: "HVAC", value: 8, color: "#8B5CF6" },
    { name: "Other", value: 2, color: "#EF4444" },
  ];

  const stats = [
    {
      name: "Platform Revenue",
      value: "$119,800",
      change: "+18.5%",
      changeType: "positive",
      icon: CurrencyDollarIcon,
    },
    {
      name: "Total Orders",
      value: "1,730",
      change: "+12.2%",
      changeType: "positive",
      icon: ArrowTrendingUpIcon,
    },
    {
      name: "Avg Order Value",
      value: "$69.25",
      change: "+5.8%",
      changeType: "positive",
      icon: CurrencyDollarIcon,
    },
    {
      name: "Active Partners",
      value: "70",
      change: "+8.3%",
      changeType: "positive",
      icon: UserGroupIcon,
    },
  ];

  const topEarningPartners = [
    {
      id: 1,
      partner: "Elite Electrical Services",
      service: "Electrical",
      earnings: "$12,450",
      orders: 156,
      rating: 4.8,
      location: "NY",
    },
    {
      id: 2,
      partner: "PlumbRight Solutions",
      service: "Plumbing",
      earnings: "$18,750",
      orders: 203,
      rating: 4.6,
      location: "IL",
    },
    {
      id: 3,
      partner: "CleanPro Housekeeping",
      service: "Cleaning",
      earnings: "$8,920",
      orders: 89,
      rating: 4.9,
      location: "CA",
    },
    {
      id: 4,
      partner: "CoolBreeze HVAC",
      service: "HVAC",
      earnings: "$11,200",
      orders: 134,
      rating: 4.7,
      location: "FL",
    },
    {
      id: 5,
      partner: "GreenThumb Landscaping",
      service: "Landscaping",
      earnings: "$6,800",
      orders: 67,
      rating: 4.5,
      location: "WA",
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Platform Earnings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitor platform revenue, partner earnings, and financial performance
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <IconComponent className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={platformEarningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalEarnings" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Partner Earnings Breakdown */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Partner Earnings by Service</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={partnerEarningsBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {partnerEarningsBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Earning Partners */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Top Earning Partners</h3>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {topEarningPartners.map((partner) => (
                <li key={partner.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserGroupIcon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {partner.partner}
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
                        <span className="text-sm font-medium text-gray-900">{partner.earnings}</span>
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
