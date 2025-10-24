import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, XIcon, CreditCardIcon, SmartphoneIcon, BuildingIcon } from 'lucide-react';
import { formatCurrency, validateAmount } from '@/utils/walletUtils';
import { useRazorpay } from '@/hooks/useRazorpay';

interface AddAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAmount: () => void;
  balance: number;
  partnerId: string;
  partnerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function AddAmountModal({ 
  isOpen, 
  onClose, 
  onAddAmount,
  balance,
  partnerId,
  partnerInfo
}: AddAmountModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('CC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { initiatePayment, isLoading, error: paymentError, clearError, isPolling } = useRazorpay();

  // Handle payment completion
  useEffect(() => {
    if (!isPolling && !isLoading && !isProcessing && !error && !paymentError) {
      // Payment completed successfully, call the callback
      onAddAmount();
    }
  }, [isPolling, isLoading, isProcessing, error, paymentError, onAddAmount]);

  const handleSubmit = async () => {
    if (!validateAmount(amount)) return;
    
    setIsProcessing(true);
    clearError();

    try {
      const result = await initiatePayment({
        amount: parseFloat(amount),
        partnerId: partnerId,
        customerInfo: {
          customerName: partnerInfo?.name || 'Partner',
          customerEmailId: partnerInfo?.email || 'partner@example.com',
          customerMobileNo: partnerInfo?.phone || '9999999999',
        }
      });

      console.log('🔍 Payment result received:', {
        success: result.success,
        message: result.message,
        error: result.error,
        fullResult: result
      });

      if (result.success) {
        console.log('✅ Payment initiated successfully');
        
        // For WebView scenarios, keep modal open and show polling status
        if (isPolling) {
          console.log('🔄 Payment polling active - keeping modal open');
          // Modal stays open to show polling status
        } else {
          // For non-WebView scenarios, close modal after short delay
          setTimeout(() => {
            onClose();
            onAddAmount(); // Call the callback to refresh data
          }, 2000);
        }
      } else {
        console.error('Payment initiation failed:', result.error);
        
        // Show user-friendly error messages
        const userMessage = result.error || 'Payment initiation failed';
        
        setError(userMessage);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Error initiating payment:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = useCallback(() => {
    setAmount('');
    setError(null);
    onClose();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-gray-900">Add Money</h3>
          <button
            onClick={handleClose}
            className="h-8 w-8 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-5 overflow-y-auto">
          {/* Current Balance Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Current Balance</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(balance)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Amount to Add
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-lg">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
                autoFocus
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPaymentMode('CC')}
                className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                  selectedPaymentMode === 'CC'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCardIcon className="h-5 w-5 mb-1" />
                <div className="text-xs font-medium">Credit Card</div>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedPaymentMode('DC')}
                className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                  selectedPaymentMode === 'DC'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCardIcon className="h-5 w-5 mb-1" />
                <div className="text-xs font-medium">Debit Card</div>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedPaymentMode('UPI')}
                className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                  selectedPaymentMode === 'UPI'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <SmartphoneIcon className="h-5 w-5 mb-1" />
                <div className="text-xs font-medium">UPI</div>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedPaymentMode('NB')}
                className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                  selectedPaymentMode === 'NB'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <BuildingIcon className="h-5 w-5 mb-1" />
                <div className="text-xs font-medium">Net Banking</div>
              </button>
            </div>
          </div>

          {/* Payment Status Display */}
          {isPolling && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Payment in Progress</p>
                  <p className="text-xs text-blue-600">Please complete payment in the external app</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {(error || paymentError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error || paymentError}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!validateAmount(amount) || isLoading || isProcessing || isPolling}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 h-11 rounded-lg font-semibold text-white flex items-center justify-center"
            >
              {isLoading || isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Processing...</span>
                </>
              ) : isPolling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Payment in Progress...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  <span>Add Money</span>
                </>
              )}
            </button>
            <button
              onClick={handleClose}
              disabled={isLoading || isProcessing || isPolling}
              className="flex-1 h-11 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
