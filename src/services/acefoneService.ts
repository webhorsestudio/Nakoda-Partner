// Acefone Masked Calling Service
import { ACEFONE_CONFIG, CALL_STATUS, CallType, CallStatus } from '@/config/acefone';

export interface MaskedCallRequest {
  partnerPhone: string;
  customerPhone: string;
  callType: CallType;
  orderId?: string;
  partnerId?: number; // Changed from string to number
  customerId?: string;
}

export interface MaskedCallResponse {
  success: boolean;
  callId?: string;
  virtualNumber?: string;
  status: CallStatus;
  message: string;
  error?: string;
}

export interface CallLog {
  callId: string;
  partnerPhone: string;
  customerPhone: string;
  virtualNumber: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: CallStatus;
  orderId?: string;
  partnerId?: number; // Changed from string to number
  customerId?: string;
}

class AcefoneService {
  private jwtToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // Initialize service
  }

  /**
   * Check if Acefone credentials are configured
   */
  private isConfigured(): boolean {
    return !!(ACEFONE_CONFIG.API_TOKEN && ACEFONE_CONFIG.SECRET_KEY);
  }

  /**
   * Initiate a masked call between partner and customer
   */
  async initiateMaskedCall(request: MaskedCallRequest): Promise<MaskedCallResponse> {
    try {
      // Check if Acefone is properly configured
      if (!this.isConfigured()) {
        console.warn('⚠️ Acefone not configured, falling back to direct call');
        return this.fallbackToDirectCall(request);
      }

      // Prepare call data with correct field names (agent_number, destination_number)
      const callData = {
        agent_number: this.formatPhoneNumber(request.partnerPhone), // Partner's number
        destination_number: this.formatPhoneNumber(request.customerPhone), // Customer's number
        caller_id: ACEFONE_CONFIG.DID_NUMBER, // Your DID number
        virtual_number: ACEFONE_CONFIG.DID_NUMBER, // Virtual number for masking
        
        // Optional parameters
        order_id: request.orderId,
        partner_id: request.partnerId,
        customer_id: request.customerId,
        
        // Call settings
        ring_duration: ACEFONE_CONFIG.CALL_SETTINGS.RING_DURATION,
        record_call: ACEFONE_CONFIG.CALL_SETTINGS.RECORD_CALL,
        call_timeout: ACEFONE_CONFIG.CALL_SETTINGS.CALL_TIMEOUT,
        mask_numbers: ACEFONE_CONFIG.CALL_SETTINGS.MASK_NUMBERS
      };

      console.log('📞 Initiating masked call with data:', callData);

      // Make API call to initiate call with Bearer token (working format)
      const response = await fetch(ACEFONE_CONFIG.CALL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${ACEFONE_CONFIG.API_TOKEN}`, // Use token directly
        },
        body: JSON.stringify(callData)
      });

      const result = await response.json();
      console.log('📞 Acefone call response:', result);

      if (response.ok && result.success) {
        // Log the call for tracking
        await this.logCall({
          callId: result.call_id,
          partnerPhone: request.partnerPhone,
          customerPhone: request.customerPhone,
          virtualNumber: ACEFONE_CONFIG.DID_NUMBER,
          startTime: new Date().toISOString(),
          status: CALL_STATUS.INITIATED,
          orderId: request.orderId,
          partnerId: request.partnerId,
          customerId: request.customerId
        });

        return {
          success: true,
          callId: result.call_id,
          virtualNumber: ACEFONE_CONFIG.DID_NUMBER,
          status: CALL_STATUS.INITIATED,
          message: 'Call initiated successfully'
        };
      } else {
        throw new Error(result.message || 'Failed to initiate call');
      }
    } catch (error) {
      console.error('❌ Acefone call initiation error:', error);
      
      // Fallback to direct call if Acefone fails
      console.warn('⚠️ Acefone failed, falling back to direct call');
      return this.fallbackToDirectCall(request);
    }
  }

  /**
   * Fallback to direct call when Acefone is not available
   */
  private fallbackToDirectCall(request: MaskedCallRequest): MaskedCallResponse {
    console.log('📞 Fallback: Direct call initiated');
    
    // Log the fallback call
    this.logCall({
      callId: `fallback_${Date.now()}`,
      partnerPhone: request.partnerPhone,
      customerPhone: request.customerPhone,
      virtualNumber: 'DIRECT_CALL',
      startTime: new Date().toISOString(),
      status: CALL_STATUS.INITIATED,
      orderId: request.orderId,
      partnerId: request.partnerId,
      customerId: request.customerId
    });

    return {
      success: true,
      callId: `fallback_${Date.now()}`,
      virtualNumber: 'DIRECT_CALL',
      status: CALL_STATUS.INITIATED,
      message: 'Direct call initiated (Acefone not available)'
    };
  }

  /**
   * Get call status (placeholder - would need to implement based on Acefone API)
   */
  async getCallStatus(callId: string): Promise<CallStatus> {
    try {
      // This would need to be implemented based on Acefone's status API
      // For now, return a default status
      console.log('📞 Getting call status for:', callId);
      return CALL_STATUS.INITIATED;
    } catch (error) {
      console.error('Error getting call status:', error);
      return CALL_STATUS.FAILED;
    }
  }

  /**
   * Get call logs for an order
   */
  async getCallLogs(_orderId: string): Promise<CallLog[]> {
    try {
      // This would typically fetch from your database
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error fetching call logs:', error);
      return [];
    }
  }

  /**
   * Format phone number for India (Acefone format - without + sign)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If it's 10 digits, add 91 (without +)
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    
    // If it already has country code, return as is
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned;
    }
    
    // If it already has +91, remove the +
    if (phone.startsWith('+91')) {
      return phone.substring(1);
    }
    
    // Default: add 91 (without +)
    return `91${cleaned}`;
  }

  /**
   * Log call details to database
   */
  private async logCall(callLog: CallLog): Promise<void> {
    try {
      // Import supabase here to avoid circular dependencies
      const { supabase } = await import('@/lib/supabase');
      
      const { error } = await supabase
        .from('call_logs')
        .insert({
          call_id: callLog.callId,
          partner_phone: callLog.partnerPhone,
          customer_phone: callLog.customerPhone,
          virtual_number: callLog.virtualNumber,
          order_id: callLog.orderId,
          partner_id: callLog.partnerId,
          customer_id: callLog.customerId,
          call_type: 'partner_to_customer',
          status: callLog.status,
          start_time: callLog.startTime,
          end_time: callLog.endTime,
          duration: callLog.duration
        });

      if (error) {
        console.error('Error logging call to database:', error);
      } else {
        console.log('Call logged successfully:', callLog.callId);
      }
    } catch (error) {
      console.error('Error logging call:', error);
    }
  }
}

// Export singleton instance
export const acefoneService = new AcefoneService();
export default acefoneService;
