"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  PhoneIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function OrderDetailsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for UI demonstration
  const mockOrders = [
    {
      id: 'ORD-001',
      customerName: 'John Smith',
      customerPhone: '+91 98765 43210',
      serviceType: 'AC Service',
      location: 'Mumbai, Maharashtra',
      scheduledDate: '2024-01-20',
      scheduledTime: '10:00 AM - 12:00 PM',
      amount: 2500,
      status: 'confirmed',
      partner: 'CoolTech Solutions',
      orderDate: '2024-01-15'
    },
    {
      id: 'ORD-002',
      customerName: 'Sarah Johnson',
      customerPhone: '+91 98765 43211',
      serviceType: 'Home Cleaning',
      location: 'Pune, Maharashtra',
      scheduledDate: '2024-01-21',
      scheduledTime: '2:00 PM - 4:00 PM',
      amount: 1800,
      status: 'pending',
      partner: 'CleanPro Services',
      orderDate: '2024-01-16'
    },
    {
      id: 'ORD-003',
      customerName: 'Mike Wilson',
      customerPhone: '+91 98765 43212',
      serviceType: 'Plumbing',
      location: 'Nagpur, Maharashtra',
      scheduledDate: '2024-01-22',
      scheduledTime: '9:00 AM - 11:00 AM',
      amount: 3200,
      status: 'completed',
      partner: 'PlumbRight Solutions',
      orderDate: '2024-01-17'
    },
    {
      id: 'ORD-004',
      customerName: 'Lisa Brown',
      customerPhone: '+91 98765 43213',
      serviceType: 'Electrical',
      location: 'Aurangabad, Maharashtra',
      scheduledDate: '2024-01-23',
      scheduledTime: '3:00 PM - 5:00 PM',
      amount: 2100,
      status: 'confirmed',
      partner: 'Elite Electrical',
      orderDate: '2024-01-18'
    }
  ];

  const getStatusColor = (status: string) => {
    const statusConfig = {
      confirmed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const statusConfig = {
      confirmed: '✅',
      pending: '⏳',
      completed: '🎉',
      cancelled: '❌'
    };
    
    return statusConfig[status as keyof typeof statusConfig] || '❓';
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and view detailed order information
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              + New Order
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by customer name, order ID, or service type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
              {/* Order Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">{order.id}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{order.customerName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{order.customerPhone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{order.location}</span>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-3 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">Service Details</h4>
                  <p className="text-sm text-blue-800">{order.serviceType}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{order.scheduledDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{order.scheduledTime}</span>
                </div>
              </div>

              {/* Partner and Amount */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Partner:</span> {order.partner}
                </div>
                <div className="flex items-center space-x-1">
                  <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                  <span className="font-bold text-green-600">₹{order.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Order Date */}
              <div className="mt-3 text-xs text-gray-500 text-center">
                Ordered on {order.orderDate}
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <MagnifyingGlassIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
