"use client";

import { useState, useEffect } from "react";
import {
  UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false);
  
  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const platformStats = [
    { 
      name: "Total Platform Orders", 
      value: "156", 
      change: "+23", 
      changeType: "positive",
      icon: CalendarIcon,
      color: "text-blue-400"
    },
    { 
      name: "Active Partners", 
      value: "24", 
      change: "+3", 
      changeType: "positive",
      icon: UserGroupIcon,
      color: "text-green-400"
    },
    { 
      name: "Platform Revenue", 
      value: "$28,450", 
      change: "+18%", 
      changeType: "positive",
      icon: CurrencyDollarIcon,
      color: "text-green-400"
    },
    { 
      name: "Platform Rating", 
      value: "4.7", 
      change: "+0.3", 
      changeType: "positive",
      icon: StarIcon,
      color: "text-yellow-400"
    },
  ];
  
  const topPerformingPartners = [
    { 
      id: 1, 
      name: "Elite Electrical Services", 
      service: "Electrical", 
      orders: 45, 
      rating: 4.9, 
      revenue: "$5,850",
      status: "Active",
      location: "New York, NY"
    },
    { 
      id: 2, 
      name: "CleanPro Housekeeping", 
      service: "Cleaning", 
      orders: 38, 
      rating: 4.8, 
      revenue: "$3,420",
      status: "Active",
      location: "Los Angeles, CA"
    },
    { 
      id: 3, 
      name: "PlumbRight Solutions", 
      service: "Plumbing", 
      orders: 32, 
      rating: 4.7, 
      revenue: "$4,800",
      status: "Active",
      location: "Chicago, IL"
    },
    { 
      id: 4, 
      name: "CoolBreeze HVAC", 
      service: "HVAC", 
      orders: 28, 
      rating: 4.6, 
      revenue: "$3,920",
      status: "Active",
      location: "Miami, FL"
    },
    { 
      id: 5, 
      name: "GreenThumb Landscaping", 
      service: "Landscaping", 
      orders: 22, 
      rating: 4.5, 
      revenue: "$2,640",
      status: "Active",
      location: "Seattle, WA"
    }
  ];
  
  const recentPlatformOrders = [
    { 
      id: "ORD-001", 
      customer: "John Smith", 
      partner: "Elite Electrical Services",
      service: "Electrical Repair", 
      status: "In Progress", 
      time: "2 hours ago",
      amount: "$120"
    },
    { 
      id: "ORD-002", 
      customer: "Sarah Johnson", 
      partner: "CleanPro Housekeeping",
      service: "House Cleaning", 
      status: "Completed", 
      time: "4 hours ago",
      amount: "$85"
    },
    { 
      id: "ORD-003", 
      customer: "Mike Wilson", 
      partner: "PlumbRight Solutions",
      service: "Plumbing Repair", 
      status: "Pending", 
      time: "6 hours ago",
      amount: "$150"
    },
    { 
      id: "ORD-004", 
      customer: "Lisa Brown", 
      partner: "Elite Electrical Services",
      service: "Electrical Installation", 
      status: "Scheduled", 
      time: "1 day ago",
      amount: "$200"
    },
    { 
      id: "ORD-005", 
      customer: "David Lee", 
      partner: "CoolBreeze HVAC",
      service: "AC Maintenance", 
      status: "Completed", 
      time: "1 day ago",
      amount: "$180"
    }
  ];
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "In Progress":
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case "Pending":
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Scheduled":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white shadow rounded-lg p-5">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here&apos;s what&apos;s happening across the Nakoda platform today.
        </p>
      </div>

      {/* Role Test Component */}
      <div className="mb-6">
        {/* Removed RoleTest component */}
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {platformStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Partners */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Top Performing Partners</h3>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {topPerformingPartners.map((partner) => (
                  <li key={partner.id} className="py-4">
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
            <div className="mt-6">
              <a href="/admin/partners" className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" suppressHydrationWarning>
                View all partners
              </a>
            </div>
          </div>
        </div>
    
        {/* Recent Platform Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Recent Platform Orders</h3>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentPlatformOrders.map((order) => (
                  <li key={order.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <UsersIcon className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {order.customer}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500 truncate">
                            {order.service}
                          </p>
                          <span className="text-sm text-gray-400">•</span>
                          <p className="text-sm text-gray-500 truncate">
                            {order.partner}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{order.amount}</span>
                          {getStatusIcon(order.status)}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className="text-sm text-gray-500">{order.time}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <a href="/admin/orders" className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" suppressHydrationWarning>
                View all orders
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
