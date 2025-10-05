import { useState, useCallback } from 'react';

interface Bitrix24OrderDetails {
  id: string;
  orderNumber: string;
  title: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  pinCode: string;
  serviceDate: string;
  timeSlot: string;
  package: string;
  partner: string;
  status: string;
  commission: string;
  advanceAmount: number;
  taxesAndFees: string;
  serviceType: string;
  mode: string;
  specification: string;
  currency: string;
  bitrix24Id: string;
  stageId: string;
}

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

      console.log(`📥 Adding order ${orderDetails.orderNumber} to database...`);

      const response = await fetch('/api/admin/orders/add-to-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderDetails }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`✅ Order ${orderDetails.orderNumber} successfully added to database with ID: ${data.order.id}`);
        
        // Send WATI WhatsApp message after successful database addition
        try {
          console.log(`📱 Sending WATI message for order ${orderDetails.orderNumber}...`);
          
          const watiOrderData = {
            customerName: orderDetails.customerName,
            customerPhone: orderDetails.customerPhone,
            orderId: orderDetails.orderNumber,
            orderAmount: orderDetails.amount,
            address: orderDetails.address,
            serviceDetails: orderDetails.package || orderDetails.serviceType,
            fees: orderDetails.taxesAndFees || '0',
            serviceDate: orderDetails.serviceDate,
            timeSlot: orderDetails.timeSlot
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
