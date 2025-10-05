"use client";

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AddNewOrderModal } from '@/components/admin/AddNewOrderModal';
import { OrderCard } from '@/components/admin/OrderCard';
import { OrderDetailsModal } from '@/components/admin/OrderDetailsModal';
import { EditOrderModal } from '@/components/admin/EditOrderModal';
import { DeleteOrderModal } from '@/components/admin/DeleteOrderModal';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  mobileNumber: string;
  city: string;
  address: string;
  pinCode: string;
  serviceType: string;
  serviceDate: string;
  timeSlot: string;
  amount: number;
  currency: string;
  status: string;
  partner: string;
  orderDate: string;
}

interface ApiOrderData {
  id: string;
  orderNumber?: string;
  customerName?: string;
  customerPhone?: string;
  location?: string;
  serviceType?: string;
  serviceDate?: string;
  timeSlot?: string;
  estimatedDuration?: string;
  amount?: number;
  currency?: string;
  status?: string;
  partnerName?: string;
  partnerId?: string | null;
  createdAt?: string;
  package?: string;
}

export default function OrderDetailsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add New Order Modal State
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  
  // Order Action Modals State
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch all orders from API (both assigned and unassigned)
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/orders/realtime-orders');
      
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Ensure result.orders is an array before proceeding
      if (result.success && Array.isArray(result.orders)) {
        const transformedOrders = result.orders.map((order: ApiOrderData) => {
          const partnerDisplay = order.partnerName || 'Ready to Assign';
          
          return {
            id: order.id,
            orderNumber: order.orderNumber || 'N/A',
            customerName: order.customerName || 'Unknown Customer',
            mobileNumber: order.customerPhone || '',
            city: order.location?.split(' - ')[0] || '',
            address: order.location || '',
            pinCode: order.location?.split(' - ')[1] || '',
            serviceType: order.serviceType || order.package || 'General Service',
            serviceDate: order.serviceDate || '',
            timeSlot: order.timeSlot || '',
            amount: parseFloat(String(order.amount || '0')) || 0,
            currency: order.currency || 'INR',
            status: order.status || 'pending',
            partner: partnerDisplay, // Show partner or "Ready to Assign"
            orderDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''
          };
        });
        
        setOrders(transformedOrders);
      } else {
        // Handle case where result.orders is undefined/null or not an array
        setOrders([]);
        if (result.error) {
          setError(result.error);
        } else {
          setError('No orders data received from server');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Auto-refresh every 5 minutes (admin doesn't need real-time updates like partners)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllOrders();
    }, 300000); // 5 minutes instead of 30 seconds

    return () => clearInterval(interval);
  }, []);


  // Handle order actions
  const handleViewOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowOrderDetailsModal(true);
    }
  };

  const handleEditOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowEditOrderModal(true);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowDeleteOrderModal(true);
    }
  };

  const handleOrderUpdated = () => {
    fetchAllOrders(); // Refresh the orders list
  };

  const handleOrderDeleted = () => {
    fetchAllOrders(); // Refresh the orders list
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Loading all orders...
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
                <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Error loading orders
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-red-400">
              <MagnifyingGlassIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error Occurred</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
                   <div className="mt-6">
                     <Button onClick={fetchAllOrders} variant="outline">
                       Try Again
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
              <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage all orders - assigned and ready to assign
              </p>
            </div>
            
            {/* Add New Order Button */}
            <Button
              onClick={() => setShowAddOrderModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Order
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ overflow: 'visible' }}>
        {/* Search and Filter */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by customer name, order number, or service..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <div className="text-sm text-gray-500">
                {filteredOrders.length} of {orders.length} orders
              </div>
            </div>
          </div>
        </Card>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" style={{ overflow: 'visible' }}>
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewOrder={handleViewOrder}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
            />
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
      <AddNewOrderModal
        isOpen={showAddOrderModal}
        onClose={() => setShowAddOrderModal(false)}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetailsModal}
        onClose={() => setShowOrderDetailsModal(false)}
        order={selectedOrder}
      />

      {/* Edit Order Modal */}
      <EditOrderModal
        isOpen={showEditOrderModal}
        onClose={() => setShowEditOrderModal(false)}
        order={selectedOrder}
        onOrderUpdated={handleOrderUpdated}
      />

      {/* Delete Order Modal */}
      <DeleteOrderModal
        isOpen={showDeleteOrderModal}
        onClose={() => setShowDeleteOrderModal(false)}
        order={selectedOrder}
        onOrderDeleted={handleOrderDeleted}
      />
    </div>
  );
}
