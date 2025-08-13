'use client';

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Order } from '@/types/orders'
import { toast } from 'react-hot-toast'

interface OrderEditModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedOrder: Partial<Order>) => Promise<void>
}

export function OrderEditModal({ order, isOpen, onClose, onSave }: OrderEditModalProps) {
  const [formData, setFormData] = useState<Partial<Order>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<string>('')
  const [originalStatus, setOriginalStatus] = useState<string>('')

  // Helper function to clean currency values (remove |INR, |USD, etc.)
  const cleanCurrencyValue = (value: string | null | undefined): string => {
    if (!value) return ''
    
    // Remove currency codes like |INR, |USD, etc.
    let cleaned = value.replace(/\|[A-Z]{3}$/, '')
    
    // Also handle cases where there might be extra spaces or multiple pipes
    cleaned = cleaned.replace(/\s*\|\s*[A-Z]{3}/g, '')
    
    // Remove any trailing currency symbols like ₹, $, etc.
    cleaned = cleaned.replace(/[₹$€£¥]\s*$/, '')
    
    // Trim whitespace
    cleaned = cleaned.trim()
    
    return cleaned
  }

  // Initialize form data when order changes
  useEffect(() => {
    if (order) {
      setFormData({
        customer_name: order.customer_name || '',
        mobile_number: order.mobile_number || '',
        address: order.address || '',
        city: order.city || '',
        pin_code: order.pin_code || '',
        partner: order.partner || '',
        package: order.package || '',
        service_date: order.service_date || '',
        time_slot: order.time_slot || '',
        amount: cleanCurrencyValue(String(order.amount || '')),
        commission_percentage: order.commission_percentage || '',
        taxes_and_fees: cleanCurrencyValue(order.taxes_and_fees),
        advance_amount: cleanCurrencyValue(order.advance_amount),
        status: order.status || 'new',
        comments: order.comments || '',
        additional_info: order.additional_info || ''
      })
      setOriginalStatus(order.status || 'new')
      setErrors({})
    }
  }, [order])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleStatusChange = (newStatus: string) => {
    // Check if this is a significant status change that requires confirmation
    const significantChanges = [
      { from: 'new', to: 'completed' },
      { from: 'new', to: 'cancelled' },
      { from: 'in_progress', to: 'cancelled' },
      { from: 'in_progress', to: 'completed' }
    ]

    const isSignificantChange = significantChanges.some(
      change => change.from === originalStatus && change.to === newStatus
    )

    if (isSignificantChange) {
      setPendingStatusChange(newStatus)
      setShowStatusConfirm(true)
    } else {
      // For minor changes, update directly
      handleInputChange('status', newStatus)
    }
  }

  const confirmStatusChange = () => {
    handleInputChange('status', pendingStatusChange)
    setShowStatusConfirm(false)
    setPendingStatusChange('')
  }

  const cancelStatusChange = () => {
    setShowStatusConfirm(false)
    setPendingStatusChange('')
    // Revert to original status
    setFormData(prev => ({ ...prev, status: originalStatus }))
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.customer_name?.trim()) {
      newErrors.customer_name = 'Customer name is required'
    }

    if (!formData.mobile_number?.trim()) {
      newErrors.mobile_number = 'Mobile number is required'
    }

    if (!formData.city?.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.package?.trim()) {
      newErrors.package = 'Service package is required'
    }

    if (!formData.amount || parseFloat(String(formData.amount)) <= 0) {
      newErrors.amount = 'Valid amount is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      await onSave(formData)
      onClose()
      // Toast notification is handled by the parent component (OrdersTable)
    } catch (error) {
      console.error('Failed to save order:', error)
      setErrors({ general: 'Failed to save order. Please try again.' })
      toast.error('Failed to update order. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!order) return null

  return (
    <>
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
                        Edit Order - {order.order_number || `Bitrix24 ID: ${order.bitrix24_id}`}
                      </Dialog.Title>

                      {errors.general && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-600 text-sm">{errors.general}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Order Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Order Number
                              </label>
                              <input
                                type="text"
                                value={formData.order_number || order.order_number || 'N/A'}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                              />
                              <p className="text-xs text-gray-500 mt-1">Order number cannot be edited</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bitrix24 ID
                              </label>
                              <input
                                type="text"
                                value={order.bitrix24_id}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                              />
                              <p className="text-xs text-gray-500 mt-1">Bitrix24 ID cannot be edited</p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                value={formData.status || 'new'}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="new">New</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount (₹)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={formData.amount || ''}
                                onChange={(e) => handleInputChange('amount', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.amount ? 'border-red-300' : 'border-gray-300'
                                }`}
                              />
                              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Commission (%)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={formData.commission_percentage || ''}
                                onChange={(e) => handleInputChange('commission_percentage', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Taxes and Fees (₹)
                              </label>
                              <input
                                type="text"
                                value={formData.taxes_and_fees || ''}
                                onChange={(e) => handleInputChange('taxes_and_fees', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Customer Name *
                              </label>
                              <input
                                type="text"
                                value={formData.customer_name || ''}
                                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.customer_name ? 'border-red-300' : 'border-gray-300'
                                }`}
                              />
                              {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mobile Number *
                              </label>
                              <input
                                type="tel"
                                value={formData.mobile_number || ''}
                                onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.mobile_number ? 'border-red-300' : 'border-gray-300'
                                }`}
                              />
                              {errors.mobile_number && <p className="text-red-500 text-xs mt-1">{errors.mobile_number}</p>}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                              </label>
                              <textarea
                                value={formData.address || ''}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                City *
                              </label>
                              <input
                                type="text"
                                value={formData.city || ''}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.city ? 'border-red-300' : 'border-gray-300'
                                }`}
                              />
                              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pin Code
                              </label>
                              <input
                                type="text"
                                value={formData.pin_code || ''}
                                onChange={(e) => handleInputChange('pin_code', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Partner Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Partner Information</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Partner Name
                              </label>
                              <input
                                type="text"
                                value={formData.partner || ''}
                                onChange={(e) => handleInputChange('partner', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Package *
                              </label>
                              <input
                                type="text"
                                value={formData.package || ''}
                                onChange={(e) => handleInputChange('package', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.package ? 'border-red-300' : 'border-gray-300'
                                }`}
                              />
                              {errors.package && <p className="text-red-500 text-xs mt-1">{errors.package}</p>}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Advance Amount (₹)
                              </label>
                              <input
                                type="text"
                                value={formData.advance_amount || ''}
                                onChange={(e) => handleInputChange('advance_amount', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Date
                              </label>
                              <input
                                type="date"
                                value={formData.service_date ? formData.service_date.split('T')[0] : ''}
                                onChange={(e) => handleInputChange('service_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Time Slot
                              </label>
                              <select
                                value={formData.time_slot || ''}
                                onChange={(e) => handleInputChange('time_slot', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select Time Slot</option>
                                <option value="4972">8:00AM - 10:00AM</option>
                                <option value="4974">10:00AM - 12:00PM</option>
                                <option value="4976">12:00PM - 2:00PM</option>
                                <option value="4978">2:00PM - 4:00PM</option>
                                <option value="4980">4:00PM - 6:00PM</option>
                                <option value="4982">6:00PM - 8:00PM</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Comments
                              </label>
                              <textarea
                                value={formData.comments || ''}
                                onChange={(e) => handleInputChange('comments', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Additional Info
                              </label>
                              <textarea
                                value={formData.additional_info || ''}
                                onChange={(e) => handleInputChange('additional_info', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-8 flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={onClose}
                          className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="inline-flex items-center px-8 py-3 border border-transparent rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:scale-100"
                        >
                          {isSaving ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="font-medium">Saving Changes...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="font-medium">Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Status Change Confirmation Dialog */}
      <Transition.Root show={showStatusConfirm} as={Fragment}>
        <Dialog as="div" className="relative z-60" onClose={cancelStatusChange}>
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Confirm Status Change
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to change the order status from{' '}
                          <span className="font-medium text-gray-900">
                            {originalStatus.replace('_', ' ')}
                          </span>{' '}
                          to{' '}
                          <span className="font-medium text-gray-900">
                            {pendingStatusChange.replace('_', ' ')}
                          </span>?
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          This action cannot be easily undone and may affect order processing.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                      onClick={confirmStatusChange}
                    >
                      Confirm Change
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={cancelStatusChange}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
