"use client";

import React, { useState, useEffect } from 'react';
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
  ClockIcon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  location: string;
  scheduledDate: string;
  scheduledTime: string;
  amount: number;
  status: string;
  partner: string;
  orderDate: string;
}

export default function OrderDetailsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Fetch accepted orders from API
  const fetchAcceptedOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/orders/accepted', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Transform API data to match UI format
        const transformedOrders: Order[] = result.orders.map((order: Record<string, unknown>) => ({
          id: order.id,
          customerName: order.customerName || 'Customer',
          customerPhone: order.customerPhone || '',
          serviceType: order.serviceType || 'General Service',
          location: order.location || 'Unknown Location',
          scheduledDate: order.serviceDate || new Date().toISOString().split('T')[0],
          scheduledTime: order.timeSlot || 'Not specified',
          amount: order.amount || 0,
          status: order.status || 'assigned',
          partner: order.partnerName || 'Unknown Partner',
          orderDate: new Date((order.createdAt || order.date_created) as string).toISOString().split('T')[0]
        }));
        
        setOrders(transformedOrders);
      } else {
        throw new Error(result.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching accepted orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchAcceptedOrders();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    });
  }, [activeDropdown]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAcceptedOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Loading accepted orders...
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Error loading orders
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-red-800">
                  Error: {error}
                </span>
              </div>
              <Button 
                onClick={fetchAcceptedOrders}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              <p className="mt-1 text-sm text-gray-500">
                Orders accepted by partners ({orders.length} total)
              </p>
            </div>
            <Button 
              onClick={fetchAcceptedOrders}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Refresh
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
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setActiveDropdown(activeDropdown === order.id ? null : order.id)}
                  >
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </Button>
                  
                  {/* Actions Dropdown */}
                  {activeDropdown === order.id && (
                    <div className="absolute right-0 top-9 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                      <button 
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => {
                          console.log('View order:', order.id);
                          setActiveDropdown(null);
                        }}
                      >
                        Actions for Order {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </button>
                      <hr className="my-1" />
                      <button 
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => {
                          console.log('View order details:', order.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                      <button 
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => {
                          console.log('Edit order:', order.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Edit Order</span>
                      </button>
                      <button 
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => {
                          console.log('Download invoice:', order.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        <span>Download Invoice</span>
                      </button>
                      <button 
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => {
                          console.log('Contact customer:', order.customerPhone);
                          setActiveDropdown(null);
                        }}
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        <span>Contact Customer</span>
                      </button>
                      <hr className="my-1" />
                      <button 
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this order?')) {
                            console.log('Cancel order:', order.id);
                          }
                          setActiveDropdown(null);
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>Cancel Order</span>
                      </button>
                    </div>
                  )}
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
