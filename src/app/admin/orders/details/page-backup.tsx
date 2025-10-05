"use client";

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AddNewOrderModal } from '@/components/admin/AddNewOrderModal';
import { OrderCard } from '@/components/admin/OrderCard';
import { formatServiceDateTime } from '@/utils/timeSlots';
import { formatDateOnly } from '@/utils/orders';

interface Order {
  id: string;
  orderNumber: string;
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

interface ApiOrderResponse {
  id: string;
  orderNumber?: string;
  customerName?: string;
  customerPhone?: string;
  serviceType?: string;
  location?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  amount?: number;
  status?: string;
  partnerName?: string;
  orderDate?: string;
}


export default function OrderDetailsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  
  // Add New Order Modal States
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [fetchingOrder, setFetchingOrder] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchedOrderDetails, setFetchedOrderDetails] = useState<Record<string, unknown> | null>(null);
  const [assigningPartner, setAssigningPartner] = useState(false);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [partners, setPartners] = useState<Record<string, unknown>[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [partnerSearchTerm, setPartnerSearchTerm] = useState('');
  
  // Filter partners based on search term
  const filteredPartners = partners.filter((partner) => {
    const partnerName = String((partner as Record<string, unknown>).name || '');
    return partnerName.toLowerCase().includes(partnerSearchTerm.toLowerCase());
  });

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
        const transformedOrders: Order[] = result.data.map((order: ApiOrderResponse) => ({
          id: order.id,
          orderNumber: order.orderNumber || 'N/A',
          customerName: order.customerName || 'Customer',
          customerPhone: order.customerPhone || '',
          serviceType: order.serviceType || 'General Service',
          location: order.location || 'Unknown Location',
          scheduledDate: order.scheduledDate || new Date().toISOString().split('T')[0],
          scheduledTime: order.scheduledTime || 'Not specified',
          amount: order.amount || 0,
          status: order.status || 'assigned',
          partner: order.partnerName || 'Unknown Partner',
          orderDate: order.orderDate || new Date().toISOString().split('T')[0]
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
      const target = event.target as Element;
      // Close partner dropdown if clicking outside
      if (showPartnerDropdown && !target.closest('[data-partner-dropdown]')) {
        setShowPartnerDropdown(false);
      }
      // Close actions dropdown if clicking outside
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown, showPartnerDropdown]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAcceptedOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle order assignment completion
  const handleOrderAssigned = () => {
    fetchAcceptedOrders(); // Refresh the orders list
  };

  // Handle partner assignment to order
  const assignPartnerToOrder = async () => {
    if (!selectedPartner || !fetchedOrderDetails) return;
    
    try {
      setAssigningPartner(true);
      // Add assignment logic here
      console.log('Assigning partner:', selectedPartner, 'to order:', fetchedOrderDetails);
      // Close modal after assignment
      setShowAddOrderModal(false);
    } catch (error) {
      console.error('Error assigning partner:', error);
    } finally {
      setAssigningPartner(false);
    }
  };

  // Fetch order from Bitrix24
  const fetchOrderFromBitrix24 = async () => {
    // This is a placeholder function - implement as needed
    console.log('Fetching order from Bitrix24:', orderNumberInput);
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
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowAddOrderModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New Order
              </Button>
              <Button 
                onClick={fetchAcceptedOrders}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Refresh
              </Button>
            </div>
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
              <div className="flex items-center justify-end mb-4">
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
                        Order #{order.orderNumber}
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
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded">
                    Order #{order.orderNumber}
                  </span>
                </div>
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

      {/* Add New Order Modal */}
      {showAddOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add New Order</h2>
              <Button
                onClick={() => setShowAddOrderModal(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              {/* Order Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  value={orderNumberInput}
                  onChange={(e) => setOrderNumberInput(e.target.value.toUpperCase())}
                  placeholder="Enter Order Number (e.g., MNus100356)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the exact order number from Bitrix24
                </p>
              </div>

              {/* Fetch Button */}
              <Button
                onClick={fetchOrderFromBitrix24}
                disabled={fetchingOrder || !orderNumberInput.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {fetchingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Fetching Order Details...
                  </>
                ) : (
                  'Fetch Order Details'
                )}
              </Button>

              {/* Error Display */}
              {fetchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-red-100 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-red-800">
                      {fetchError}
                    </span>
                  </div>
                </div>
              )}

              {/* Order Details Display */}
              {fetchedOrderDetails && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-1 bg-green-100 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-semibold text-green-800">
                      Order Found Successfully!
                    </span>
                  </div>

                  {/* Comprehensive Order Details Grid */}
                  <div className="space-y-4">
                    {/* Order Information */}
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-gray-900 mb-3 text-sm">Order Information</h4>
                      <div className="space-y-2 text-xs">
                        <p className="text-gray-600">
                          <span className="text-gray-600">Order Number:</span>
                          <span className="font-medium ml-1">{String(fetchedOrderDetails.orderNumber || 'N/A')}</span>
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium ml-1 text-green-600">
                            ₹{String(fetchedOrderDetails.amount || 0)}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-600">Taxes and Fee:</span>
                          <span className="font-medium ml-1">₹{String(fetchedOrderDetails.taxesAndFees || '0')}</span>
                        </p>
                      </div>
                    </div>


                    {/* Customer Information */}
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-gray-900 mb-3 text-sm">Customer Information</h4>
                      <div className="space-y-2 text-xs">
                        <p className="text-gray-600">
                          <span className="text-gray-600">Customer Name:</span>
                          <span className="font-medium ml-1">{String(fetchedOrderDetails.customerName || 'Unknown Customer')}</span>
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-600">Mobile Number:</span>
                          <span className="font-medium ml-1">{String(fetchedOrderDetails.customerPhone || '')}</span>
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-medium ml-1">{String(fetchedOrderDetails.address || '')}</span>
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-600">City:</span>
                          <span className="font-medium ml-1">{String(fetchedOrderDetails.city || '')}</span>
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-600">Pin Code:</span>
                          <span className="font-medium ml-1">{String(fetchedOrderDetails.pinCode || '')}</span>
                        </p>
                      </div>
                    </div>


                    {/* Partner Information */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-3 text-sm">Partner Information</h4>
                      <div className="space-y-2 text-xs">
                        <p className="text-gray-600">
                          <span className="text-gray-600">Service Package:</span>
                          <span className="font-medium ml-1">{String(fetchedOrderDetails.package || 'Unknown Package')}</span>
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-600">Advance Amount:</span>
                          <span className="font-medium ml-1">₹{String(fetchedOrderDetails.advanceAmount || '0')}</span>
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-600">Service Date:</span>
                          <span className="font-medium ml-1">
                            {fetchedOrderDetails.serviceDate ? 
                              formatDateOnly(String(fetchedOrderDetails.serviceDate))
                              : 'N/A'
                            }
                          </span>
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-600">Time Slot:</span>
                          <span className="font-medium ml-1">
                            {formatServiceDateTime(String(fetchedOrderDetails.timeSlot || ''), String(fetchedOrderDetails.serviceDate || '')) || 'N/A'}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-600">Mode:</span>
                          <span className="font-medium ml-1">{String(fetchedOrderDetails.mode || 'online')}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Partner Assignment Section */}
                  {fetchedOrderDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Assign to Partner</h4>
                      
                      {!assigningPartner && (
                        <div className="space-y-3">
                          {loadingPartners && (
                            <div className="text-sm text-gray-500">Loading partners...</div>
                          )}
                          
                          {partners.length > 0 && (
                            <div className="space-y-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Select Partner:
                              </label>
                              
                              {/* Custom Searchable Dropdown */}
                              <div className="relative" data-partner-dropdown>
                                <button
                                  type="button"
                                  onClick={() => setShowPartnerDropdown(!showPartnerDropdown)}
                                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                                >
                                  <span>{selectedPartner ? String((partners.find(p => p.id === selectedPartner) as Record<string, unknown>)?.name) || 'Choose a partner...' : 'Choose a partner...'}</span>
                                  <svg className={`ml-2 h-4 w-4 transition-transform ${showPartnerDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                
                                {showPartnerDropdown && (
                                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                                    {/* Search Input Inside Dropdown */}
                                    <div className="p-2 border-b border-gray-200">
                                      <div className="relative">
                                        <input
                                          type="text"
                                          placeholder="Search partners..."
                                          value={partnerSearchTerm}
                                          onChange={(e) => setPartnerSearchTerm(e.target.value)}
                                          className="w-full text-xs border border-gray-300 rounded px-2 py-1 pl-6 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          autoFocus
                                        />
                                        <MagnifyingGlassIcon className="absolute left-2 top-1.5 h-3 w-3 text-gray-400" />
                                      </div>
                                    </div>
                                    
                                    {/* Partners List */}
                                    <div className="max-h-48 overflow-y-auto">
                                      {filteredPartners.length > 0 ? (
                                        filteredPartners.map((partnerItem) => (
                                          <button
                                            key={String((partnerItem as Record<string, unknown>).id)}
                                            type="button"
                                            onClick={() => {
                                              setSelectedPartner(String((partnerItem as Record<string, unknown>).id));
                                              setShowPartnerDropdown(false);
                                              setPartnerSearchTerm('');
                                            }}
                                            className={`w-full text-xs text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                                              selectedPartner === String((partnerItem as Record<string, unknown>).id) ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                            }`}
                                          >
                                            <div className="font-medium">{String((partnerItem as Record<string, unknown>).name)}</div>
                                            <div className="text-gray-500">{String((partnerItem as Record<string, unknown>).service_type)} - {String((partnerItem as Record<string, unknown>).city)}</div>
                                          </button>
                                        ))
                                      ) : (
                                        <div className="px-3 py-2 text-xs text-gray-500">
                                          {partnerSearchTerm ? `No partners found matching "${partnerSearchTerm}"` : 'No partners available'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {!loadingPartners && partners.length === 0 && (
                            <div className="text-sm text-gray-500">No active partners available</div>
                          )}
                        </div>
                      )}
                      
                      {assigningPartner && (
                        <div className="text-sm text-blue-600">Assigning partner to order...</div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    {fetchedOrderDetails && !assigningPartner && (
                      <Button
                        onClick={assignPartnerToOrder}
                        disabled={!selectedPartner}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Assign Partner
                      </Button>
                    )}
                    <Button
                      onClick={() => setShowAddOrderModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
