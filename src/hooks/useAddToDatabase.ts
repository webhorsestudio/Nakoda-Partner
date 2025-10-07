import { useState, useCallback } from 'react';
import { convertTimeSlot } from '@/utils/timeSlotConverter';
import { extractPaymentMode, calculateBalanceAmount } from '@/utils/paymentModeExtractor';
import { Bitrix24OrderDetails } from '@/types/orders';

interface UseAddToDatabaseReturn {
  // State
  addingToDatabase: boolean;
  addToDatabaseError: string | null;
  
  // Actions
  addOrderToDatabase: (orderDetails: Bitrix24OrderDetails) => Promise<boolean>;
  clearAddToDatabaseState: () => void;
}

export const useAddToDatabase = (): UseAddToDatabaseReturn => {
  const [addingToDatabase, setAddingToDatabase] = useState(false);
  const [addToDatabaseError, setAddToDatabaseError] = useState<string | null>(null);

  const addOrderToDatabase = useCallback(async (orderDetails: Bitrix24OrderDetails): Promise<boolean> => {
    try {
      setAddingToDatabase(true);
      setAddToDatabaseError(null);

      // Adding order to database

      const response = await fetch('/api/admin/orders/add-to-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderDetails }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Send WATI WhatsApp message after successful database addition
        try {
          // Extract payment mode and calculate balance amount
          const paymentMode = extractPaymentMode(orderDetails.title);
          const totalAmount = orderDetails.amount;
          const advanceAmount = orderDetails.advanceAmount;
          const vendorAmount = orderDetails.vendorAmount;
          const balanceAmount = calculateBalanceAmount(totalAmount, advanceAmount, paymentMode, vendorAmount);
          
          const watiOrderData = {
            customerName: orderDetails.customerName,
            customerPhone: orderDetails.customerPhone,
            orderId: orderDetails.orderNumber,
            orderAmount: orderDetails.amount,
            address: orderDetails.address,
            serviceDetails: orderDetails.package || orderDetails.serviceType,
            fees: orderDetails.taxesAndFees || '0',
            serviceDate: orderDetails.serviceDate,
            timeSlot: convertTimeSlot(orderDetails.timeSlot) // Use converted time slot
          };

          const watiResponse = await fetch('/api/wati/send-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderData: watiOrderData,
              messageType: 'pipeline'
            }),
          });

          const watiData = await watiResponse.json();
          
          if (watiData.success) {
            console.log(`✅ WATI message sent successfully for order ${orderDetails.orderNumber}`);
          } else {
            console.warn(`⚠️ WATI message failed for order ${orderDetails.orderNumber}:`, watiData.error);
            // Don't fail the entire operation if WATI fails
          }
        } catch (watiError) {
          console.warn(`⚠️ WATI service error for order ${orderDetails.orderNumber}:`, watiError);
          // Don't fail the entire operation if WATI fails
        }
        
        setAddingToDatabase(false);
        return true;
      } else {
            if (data.message && data.message.includes('already exists')) {
              setAddToDatabaseError(`✅ Order ${orderDetails.orderNumber} already exists in database. It's ready for partner assignment!`);
            } else {
              setAddToDatabaseError(data.error || data.message || 'Failed to add order to database');
            }
        setAddingToDatabase(false);
        return false;
      }
    } catch (error) {
      console.error('Error adding order to database:', error);
      setAddToDatabaseError('Failed to add order to database');
      setAddingToDatabase(false);
      return false;
    }
  }, []);

  const clearAddToDatabaseState = useCallback(() => {
    setAddingToDatabase(false);
    setAddToDatabaseError(null);
  }, []);

  return {
    addingToDatabase,
    addToDatabaseError,
    addOrderToDatabase,
    clearAddToDatabaseState
  };
};
