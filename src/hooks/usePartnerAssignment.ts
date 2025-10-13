import { useState, useCallback } from 'react';
import { convertTimeSlot } from '@/utils/timeSlotConverter';
import { extractPaymentMode, calculateBalanceAmount } from '@/utils/paymentModeExtractor';
import { Partner, Bitrix24OrderDetails, ApiWalletPartner } from '@/types/orders';

interface UsePartnerAssignmentReturn {
  // Partner Data
  partners: Partner[];
  selectedPartner: number | null;
  loadingPartners: boolean;
  
  // Assignment State
  assigningPartner: boolean;
  assignmentError: string | null;
  
  // Actions
  fetchPartners: () => Promise<void>;
  selectPartner: (partnerId: number) => void;
  assignPartnerToOrder: (orderDetails: Bitrix24OrderDetails) => Promise<boolean>;
  clearAssignmentState: () => void;
}

export const usePartnerAssignment = (): UsePartnerAssignmentReturn => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [assigningPartner, setAssigningPartner] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  const fetchPartners = useCallback(async () => {
    try {
      setLoadingPartners(true);
      setAssignmentError(null);
      // Fetch partners with wallet information for admin
      const response = await fetch('/api/admin/partners/wallet?status=active&limit=1000');
      const data = await response.json();
      
      if (data.success) {
        
        // Transform wallet partners to match Partner interface
        const walletPartners = data.data.map((walletPartner: ApiWalletPartner) => ({
          id: walletPartner.id,
          name: walletPartner.name,
          service_type: walletPartner.service_type,
          status: walletPartner.status,
          city: walletPartner.city,
          mobile: walletPartner.mobile,
          wallet_balance: walletPartner.wallet_balance // Add wallet balance for UI
        }));
        
        
        setPartners(walletPartners);
      } else {
        console.error('API Response Error:', data);
        setAssignmentError('Failed to fetch partners');
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      setAssignmentError('Failed to fetch partners');
    } finally {
      setLoadingPartners(false);
    }
  }, []);

  const selectPartner = useCallback((partnerId: number) => {
    setSelectedPartner(partnerId);
    setAssignmentError(null);
  }, []);

  const assignPartnerToOrder = useCallback(async (orderDetails: Bitrix24OrderDetails): Promise<boolean> => {
    if (!selectedPartner) {
      setAssignmentError('Please select a partner first');
      return false;
    }

    try {
      setAssigningPartner(true);
      setAssignmentError(null);
      
      console.log(`💰 Checking wallet balance for partner ${selectedPartner} before assignment...`);
      
      // Use wallet-based assignment API
      const response = await fetch('/api/admin/orders/assign-with-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: orderDetails.orderNumber,
          partnerId: selectedPartner,
          advanceAmount: orderDetails.advanceAmount
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Order ${orderDetails.orderNumber} assigned to partner ${data.partner.name} successfully`);
        console.log(`💰 Wallet deduction: ₹${data.walletUpdate.deductedAmount} from ${data.partner.name}'s wallet`);
        
        // Check assignment type for conditional messaging
        const assignmentType = data.assignmentType;
        console.log(`📋 Assignment type received:`, assignmentType);
        
        // Send WATI WhatsApp messages based on assignment type
        try {
          console.log(`📱 Sending WATI messages for order ${orderDetails.orderNumber}...`);
          console.log(`📱 Partner: ${data.partner.name} (${data.partner.mobile})`);
          console.log(`📱 Customer: ${orderDetails.customerName} (${orderDetails.customerPhone})`);
          console.log(`📱 Assignment Type: ${assignmentType?.isFirstTimeAssignment ? 'First Time' : 'Reassignment'}`);
          
          // 1. Send message to PARTNER (always send to partner)
          // Convert time slot for partner message
          const partnerTimeSlot = convertTimeSlot(orderDetails.timeSlot);
          
          // Calculate balance amount for partner message (what customer needs to pay)
          const paymentMode = extractPaymentMode(orderDetails.title);
          const totalAmount = orderDetails.amount;
          const advanceAmount = orderDetails.advanceAmount;
          const vendorAmount = orderDetails.vendorAmount;
          const balanceAmount = calculateBalanceAmount(totalAmount, advanceAmount, paymentMode, vendorAmount);
          
          const partnerOrderData = {
            customerName: orderDetails.customerName,
            partnerPhone: data.partner.mobile,
            orderId: orderDetails.orderNumber,
            orderAmount: orderDetails.amount,
            address: orderDetails.address,
            serviceDetails: orderDetails.package || orderDetails.serviceType,
            fees: orderDetails.taxesAndFees || '0', // Use actual taxes and fees
            serviceDate: orderDetails.serviceDate,
            timeSlot: partnerTimeSlot, // Use converted time slot
            pendingPayment: balanceAmount, // Balance amount (what customer needs to pay)
            otp: orderDetails.orderNumber.slice(-4), // Use last 4 digits as OTP
            responsiblePerson: data.partner.name,
            previousPartnerName: assignmentType?.previousPartnerName || undefined
          };

          console.log(`📱 Partner order data for WATI:`, partnerOrderData);

          const partnerWatiResponse = await fetch('/api/wati/send-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderData: partnerOrderData,
              messageType: assignmentType?.isFirstTimeAssignment ? 'partner' : 'partner_reassignment'
            }),
          });

          const partnerWatiData = await partnerWatiResponse.json();
          
          if (partnerWatiData.success) {
            const messageType = assignmentType?.isFirstTimeAssignment ? 'assignment' : 'reassignment';
            console.log(`✅ WATI message sent successfully to partner ${data.partner.name} for order ${orderDetails.orderNumber} (${messageType})`);
          } else {
            const messageType = assignmentType?.isFirstTimeAssignment ? 'assignment' : 'reassignment';
            console.warn(`⚠️ WATI message failed for partner ${data.partner.name} for order ${orderDetails.orderNumber} (${messageType}):`, partnerWatiData.error);
          }

          // 2. Send FINAL CONFIRMATION message to CUSTOMER (only for first-time assignments)
          if (assignmentType?.isFirstTimeAssignment) {
            console.log(`📱 Sending customer confirmation message (first-time assignment)`);
            
            // Reuse the same variables from partner message calculation
            // Format time slot properly using converter
            const formattedTimeSlot = convertTimeSlot(orderDetails.timeSlot);
            
            const customerOrderData = {
              customerName: orderDetails.customerName,
              customerPhone: orderDetails.customerPhone,
              orderId: orderDetails.orderNumber,
              orderAmount: orderDetails.amount,
              address: orderDetails.address,
              serviceDetails: orderDetails.package || orderDetails.serviceType,
              fees: orderDetails.taxesAndFees || '0',
              serviceDate: orderDetails.serviceDate,
              timeSlot: formattedTimeSlot, // Use properly formatted time slot
              pendingPayment: balanceAmount, // Use calculated balance amount
              otp: orderDetails.orderNumber.slice(-4) // Use last 4 digits as OTP
            };

            console.log(`📱 Customer order data for WATI:`, customerOrderData);

            const customerWatiResponse = await fetch('/api/wati/send-message', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderData: customerOrderData,
                messageType: 'final_confirmation'
              }),
            });

            const customerWatiData = await customerWatiResponse.json();
            
            if (customerWatiData.success) {
              console.log(`✅ WATI final confirmation message sent successfully to customer ${orderDetails.customerName} for order ${orderDetails.orderNumber}`);
            } else {
              console.warn(`⚠️ WATI final confirmation message failed for customer ${orderDetails.customerName} for order ${orderDetails.orderNumber}:`, customerWatiData.error);
            }
          } else {
            console.log(`📱 Skipping customer message (reassignment - only partner notified)`);
          }

        } catch (watiError) {
          console.warn(`⚠️ WATI service error for partner assignment ${orderDetails.orderNumber}:`, watiError);
          // Don't fail the entire operation if WATI fails
        }
        
        return true; // Success
      } else {
        if (data.walletInfo) {
          // Handle insufficient balance error with detailed info
          const walletInfo = data.walletInfo;
          setAssignmentError(
            `${walletInfo.partnerName} has insufficient wallet balance. Current: ₹${walletInfo.currentBalance}, Required: ₹${walletInfo.requiredAmount}`
          );
        } else {
          setAssignmentError(data.error || 'Failed to assign order to partner');
        }
        return false;
      }
    } catch (error) {
      console.error('Error assigning partner:', error);
      setAssignmentError('Failed to assign order to partner');
      return false;
    } finally {
      setAssigningPartner(false);
    }
  }, [selectedPartner]);

  const clearAssignmentState = useCallback(() => {
    setSelectedPartner(null);
    setPartners([]);
    setAssignmentError(null);
  }, []);

  return {
    partners,
    selectedPartner,
    loadingPartners,
    assigningPartner,
    assignmentError,
    fetchPartners,
    selectPartner,
    assignPartnerToOrder,
    clearAssignmentState
  };
};
