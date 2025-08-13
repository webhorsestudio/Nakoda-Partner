import { 
  CalendarIcon, 
  CurrencyDollarIcon, 
  EyeIcon, 
  PencilIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { Order } from "@/types/orders";
import { getStatusIcon, getStatusColor, formatDate } from "@/utils/orders";
import { OrdersPagination } from "./OrdersPagination";
import { OrderDetailsModal } from "./OrderDetailsModal";

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export function OrdersTable({ 
  orders, 
  loading, 
  currentPage,
  totalPages,
  totalOrders,
  pageSize,
  onPageChange,
  onNextPage,
  onPrevPage
}: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-8">
              <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-500">Loading orders...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="text-center py-8">
              <p className="text-gray-500">No recent orders found</p>
              <p className="text-sm text-gray-400 mt-2">
                Click &quot;Sync Recent Orders&quot; to fetch latest data from Bitrix24
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Order Details
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Customer Info
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Service Details
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Created
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <CalendarIcon className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {order.order_number ? (
                                <span className="text-blue-600 font-semibold">{order.order_number}</span>
                              ) : (
                                <span className="text-gray-400 italic">No business order number</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              Mode: {order.mode || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {order.date_created ? formatDate(order.date_created) : 'N/A'}
                            </div>
                            {!order.order_number && (
                              <div className="text-xs text-red-500 mt-1">
                                Bitrix24 ID: {order.bitrix24_id}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.mobile_number || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.city || 'N/A'}, {order.pin_code || 'N/A'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.package || order.service_type || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.order_date || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.order_time || 'N/A'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
                          ₹{(typeof order.amount === 'string' ? parseFloat(order.amount) : order.amount).toLocaleString()}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {order.date_created ? formatDate(order.date_created) : 'N/A'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleViewOrder(order)}
                            title="View Order Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              <OrdersPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalOrders={totalOrders}
                pageSize={pageSize}
                onPageChange={onPageChange}
                onNextPage={onNextPage}
                onPrevPage={onPrevPage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
