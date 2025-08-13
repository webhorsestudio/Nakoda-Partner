"use client";

import { useState, useEffect } from "react";
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  MapPinIcon,
  UserIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isClient, setIsClient] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const platformCustomers = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, New York, NY",
      totalOrders: 45,
      totalSpent: "$3,850",
      rating: 4.8,
      lastOrder: "2024-01-15",
      status: "VIP",
      preferredServices: ["Electrical", "Plumbing"],
      partnerCount: 3
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 234-5678",
      address: "456 Oak Ave, Los Angeles, CA",
      totalOrders: 28,
      totalSpent: "$2,920",
      rating: 4.9,
      lastOrder: "2024-01-14",
      status: "Active",
      preferredServices: ["Cleaning", "HVAC"],
      partnerCount: 2
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike.wilson@email.com",
      phone: "+1 (555) 345-6789",
      address: "789 Pine Rd, Chicago, IL",
      totalOrders: 33,
      totalSpent: "$4,450",
      rating: 4.5,
      lastOrder: "2024-01-13",
      status: "Active",
      preferredServices: ["Electrical", "Plumbing", "Cleaning"],
      partnerCount: 4
    },
    {
      id: 4,
      name: "Lisa Brown",
      email: "lisa.brown@email.com",
      phone: "+1 (555) 456-7890",
      address: "321 Elm St, Miami, FL",
      totalOrders: 67,
      totalSpent: "$8,650",
      rating: 5.0,
      lastOrder: "2024-01-15",
      status: "VIP",
      preferredServices: ["Electrical", "Cleaning", "Landscaping"],
      partnerCount: 5
    },
    {
      id: 5,
      name: "David Lee",
      email: "david.lee@email.com",
      phone: "+1 (555) 567-8901",
      address: "654 Maple Dr, Seattle, WA",
      totalOrders: 19,
      totalSpent: "$2,680",
      rating: 4.7,
      lastOrder: "2024-01-12",
      status: "Active",
      preferredServices: ["Plumbing", "HVAC"],
      partnerCount: 2
    },
    {
      id: 6,
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+1 (555) 678-9012",
      address: "987 Cedar Ln, Phoenix, AZ",
      totalOrders: 52,
      totalSpent: "$6,320",
      rating: 4.6,
      lastOrder: "2024-01-16",
      status: "VIP",
      preferredServices: ["Cleaning", "Electrical", "HVAC"],
      partnerCount: 4
    }
  ];

  const filteredCustomers = platformCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate platform stats
  const totalCustomers = platformCustomers.length;
  const vipCustomers = platformCustomers.filter(customer => customer.status === "VIP").length;
  const totalRevenue = platformCustomers.reduce((sum, customer) => {
    return sum + parseFloat(customer.totalSpent.replace("$", "").replace(",", ""));
  }, 0);
  const avgRating = platformCustomers.reduce((sum, customer) => sum + customer.rating, 0) / platformCustomers.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VIP":
        return "bg-purple-100 text-purple-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Platform Customers</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitor and manage all customers across the platform
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            suppressHydrationWarning
          >
            View Reports
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            suppressHydrationWarning
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          suppressHydrationWarning
        >
          <option value="all">All Status</option>
          <option value="VIP">VIP</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Customer Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Platform Customers</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalCustomers}</dd>
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
                  <dd className="text-lg font-medium text-gray-900">{avgRating.toFixed(1)}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">VIP Customers</dt>
                  <dd className="text-lg font-medium text-gray-900">{vipCustomers}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${totalRevenue.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">{customer.totalOrders}</div>
                        <div className="text-sm text-gray-500">Last: {customer.lastOrder}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {customer.totalSpent}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                          <span className="ml-1 text-sm text-gray-900">{customer.rating}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-blue-600 hover:text-blue-900" suppressHydrationWarning>
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900" suppressHydrationWarning>
                            <PhoneIcon className="h-4 w-4" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-900" suppressHydrationWarning>
                            <EnvelopeIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
