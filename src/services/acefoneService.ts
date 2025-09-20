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
   * Authenticate with Acefone API and get JWT token
   */
  private async authenticate(): Promise<string> {
    // Check if we have a valid token
    if (this.jwtToken && Date.now() < this.tokenExpiry) {
      return this.jwtToken;
    }

    try {
      // Check if credentials are configured
      if (!ACEFONE_CONFIG.API_TOKEN || !ACEFONE_CONFIG.USERNAME || !ACEFONE_CONFIG.PASSWORD) {
        throw new Error('Acefone credentials not configured. Please check environment variables.');
      }

      console.log('🔐 Attempting Acefone authentication...');
      
      const response = await fetch(ACEFONE_CONFIG.AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: ACEFONE_CONFIG.USERNAME,
          password: ACEFONE_CONFIG.PASSWORD,
          api_token: ACEFONE_CONFIG.API_TOKEN
        })
      });

      console.log('🔐 Acefone auth response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔐 Acefone auth error response:', errorText);
        throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔐 Acefone auth response data:', data);
      
      if (data.success && data.token) {
        this.jwtToken = data.token;
        // Set token expiry (assuming 1 hour validity)
        this.tokenExpiry = Date.now() + (60 * 60 * 1000);
        console.log('✅ Acefone authentication successful');
        return this.jwtToken as string; // Type assertion since we know it's not null here
      } else {
        throw new Error(data.message || 'Authentication failed - no token received');
      }
    } catch (error) {
      console.error('❌ Acefone authentication error:', error);
      throw new Error(`Failed to authenticate with Acefone API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initiate a masked call between partner and customer
   */
  async initiateMaskedCall(request: MaskedCallRequest): Promise<MaskedCallResponse> {
    try {
      // Check if Acefone is properly configured
      if (!ACEFONE_CONFIG.API_TOKEN || !ACEFONE_CONFIG.USERNAME || !ACEFONE_CONFIG.PASSWORD) {
        console.warn('⚠️ Acefone not configured, falling back to direct call');
        return this.fallbackToDirectCall(request);
      }

      // Authenticate first
      const token = await this.authenticate();

      // Prepare call data
      const callData = {
        from: this.formatPhoneNumber(request.partnerPhone),
        to: this.formatPhoneNumber(request.customerPhone),
        caller_id: ACEFONE_CONFIG.DID_NUMBER, // Your DID number
        virtual_number: ACEFONE_CONFIG.DID_NUMBER, // Virtual number for masking
        call_type: request.callType,
        order_id: request.orderId,
        partner_id: request.partnerId,
        customer_id: request.customerId,
        settings: {
          ring_duration: ACEFONE_CONFIG.CALL_SETTINGS.RING_DURATION,
          record_call: ACEFONE_CONFIG.CALL_SETTINGS.RECORD_CALL,
          call_timeout: ACEFONE_CONFIG.CALL_SETTINGS.CALL_TIMEOUT,
          mask_numbers: ACEFONE_CONFIG.CALL_SETTINGS.MASK_NUMBERS
        }
      };

      console.log('📞 Initiating masked call with data:', callData);

      // Make API call to initiate call
      const response = await fetch(ACEFONE_CONFIG.CALL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
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
   * Get call status
   */
  async getCallStatus(callId: string): Promise<CallStatus> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${ACEFONE_CONFIG.CALL_URL}/${callId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.status || CALL_STATUS.FAILED;
      }
      
      return CALL_STATUS.FAILED;
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
   * Format phone number for India
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If it's 10 digits, add +91
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    // If it already has country code, return as is
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+${cleaned}`;
    }
    
    // If it already has +91, return as is
    if (phone.startsWith('+91')) {
      return phone;
    }
    
    // Default: add +91
    return `+91${cleaned}`;
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
