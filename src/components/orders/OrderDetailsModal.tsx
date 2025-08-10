import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Order } from '@/types/orders'
import { formatDate, getStatusColor, getStatusIcon } from '@/utils/orders'

interface OrderDetailsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!order) return null

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-6">
                      Order Details - {order.order_number || `Bitrix24 ID: ${order.bitrix24_id}`}
                    </Dialog.Title>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Order Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Number:</span>
                            <span className="font-medium">{order.order_number || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bitrix24 ID:</span>
                            <span className="font-medium">{order.bitrix24_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mode:</span>
                            <span className="font-medium">{order.mode || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className="flex items-center">
                              {getStatusIcon(order.status)}
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status.replace("_", " ")}
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-medium text-green-600">
                              ₹{(typeof order.amount === 'string' ? parseFloat(order.amount) : order.amount).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Currency:</span>
                            <span className="font-medium">{order.currency || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Customer Name:</span>
                            <span className="font-medium">{order.customer_name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mobile Number:</span>
                            <span className="font-medium">{order.mobile_number || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Address:</span>
                            <span className="font-medium">{order.address || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">City:</span>
                            <span className="font-medium">{order.city || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pin Code:</span>
                            <span className="font-medium">{order.pin_code || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Service Details */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Service Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Package:</span>
                            <span className="font-medium">{order.package || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Service Type:</span>
                            <span className="font-medium">{order.service_type || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Specification:</span>
                            <span className="font-medium">{order.specification || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Date:</span>
                            <span className="font-medium">{order.order_date || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Time:</span>
                            <span className="font-medium">{order.order_time || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Dates & Status */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Dates & Status</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date Created:</span>
                            <span className="font-medium">{order.date_created ? formatDate(order.date_created) : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date Modified:</span>
                            <span className="font-medium">{order.date_modified ? formatDate(order.date_modified) : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Begin Date:</span>
                            <span className="font-medium">{order.begin_date ? formatDate(order.begin_date) : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Close Date:</span>
                            <span className="font-medium">{order.close_date ? formatDate(order.close_date) : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Is Closed:</span>
                            <span className="font-medium">{order.is_closed ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Is New:</span>
                            <span className="font-medium">{order.is_new ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    {(order.comments || order.additional_info) && (
                      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                        <div className="space-y-3 text-sm">
                          {order.comments && (
                            <div>
                              <span className="text-gray-600 font-medium">Comments:</span>
                              <p className="text-gray-900 mt-1">{order.comments}</p>
                            </div>
                          )}
                          {order.additional_info && (
                            <div>
                              <span className="text-gray-600 font-medium">Additional Info:</span>
                              <p className="text-gray-900 mt-1">{order.additional_info}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bitrix24 Details */}
                    <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">Bitrix24 Details</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-blue-600 font-medium">Stage ID:</span>
                          <p className="text-blue-900">{order.stage_id || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Lead ID:</span>
                          <p className="text-blue-900">{order.lead_id || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Contact ID:</span>
                          <p className="text-blue-900">{order.contact_id || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Company ID:</span>
                          <p className="text-blue-900">{order.company_id || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Full Title */}
                    <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-3">Original Bitrix24 Title</h4>
                      <p className="text-sm text-yellow-800 break-words">{order.title}</p>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
