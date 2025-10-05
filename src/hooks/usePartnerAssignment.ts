import { useState, useCallback } from 'react';

interface Partner {
  id: number;
  name: string;
  service_type: string;
  status: string;
  city: string;
  mobile: string;
  wallet_balance?: number;
}

interface ApiWalletPartner {
  id: number;
  name: string;
  service_type: string;
  status: string;
  city: string;
  mobile: string;
  wallet_balance?: number;
}

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
      const response = await fetch('/api/admin/partners/wallet?status=active&limit=100');
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
        
        // Send WATI WhatsApp message to partner after successful assignment
        try {
          console.log(`📱 Sending WATI message to partner ${data.partner.name} for order ${orderDetails.orderNumber}...`);
          console.log(`📱 Partner mobile from API: ${data.partner.mobile}`);
          
          const partnerOrderData = {
            customerName: orderDetails.customerName,
            partnerPhone: data.partner.mobile,
            orderId: orderDetails.orderNumber,
            orderAmount: orderDetails.amount,
            address: orderDetails.address,
            serviceDetails: orderDetails.package || orderDetails.serviceType,
            fees: orderDetails.taxesAndFees || '0',
            serviceDate: orderDetails.serviceDate,
            timeSlot: orderDetails.timeSlot || 'N/A',
            pendingPayment: orderDetails.advanceAmount,
            otp: orderDetails.orderNumber.slice(-4), // Use last 4 digits as OTP
            responsiblePerson: data.partner.name
          };

          console.log(`📱 Partner order data for WATI:`, partnerOrderData);

          const watiResponse = await fetch('/api/wati/send-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderData: partnerOrderData,
              messageType: 'partner'
            }),
          });

          const watiData = await watiResponse.json();
          
          if (watiData.success) {
            console.log(`✅ WATI message sent successfully to partner ${data.partner.name} for order ${orderDetails.orderNumber}`);
          } else {
            console.warn(`⚠️ WATI message failed for partner ${data.partner.name} for order ${orderDetails.orderNumber}:`, watiData.error);
            // Don't fail the entire operation if WATI fails
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
