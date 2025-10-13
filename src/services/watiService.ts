import { WATI_CONFIG, WATITemplateMessage, OrderData, PartnerOrderData, PartnerReassignmentData } from '@/config/wati';

export interface WATIResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Format date to simple YYYY-MM-DD format
 * @param dateString - ISO date string or any date string
 * @returns Formatted date string (YYYY-MM-DD) or original string if invalid
 */
function formatDateForWATI(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'N/A';
  }

  try {
    // Handle ISO date strings like "2025-10-10T03:00:00+03:00"
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`⚠️ Invalid date string: ${dateString}`);
      return dateString; // Return original if invalid
    }

    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn(`⚠️ Error formatting date: ${dateString}`, error);
    return dateString; // Return original if error
  }
}

export class WATIService {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = WATI_CONFIG.BASE_URL;
    this.token = WATI_CONFIG.TOKEN;
  }

  /**
   * Send template message via WATI
   */
  async sendTemplateMessage(
    whatsappNumber: string,
    templateMessage: WATITemplateMessage
  ): Promise<WATIResponse> {
    try {
      console.log(`📱 Sending WATI message to ${whatsappNumber}:`, templateMessage);
      console.log(`📱 WATI URL: ${this.baseUrl}${WATI_CONFIG.ENDPOINTS.SEND_TEMPLATE}?whatsappNumber=${whatsappNumber}`);

      const url = `${this.baseUrl}${WATI_CONFIG.ENDPOINTS.SEND_TEMPLATE}?whatsappNumber=${whatsappNumber}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateMessage),
      });

      const data = await response.json();
      console.log(`📱 WATI API response status: ${response.status}`);
      console.log(`📱 WATI API response data:`, data);

      if (response.ok) {
        console.log(`✅ WATI message sent successfully to ${whatsappNumber}`);
        return {
          success: true,
          message: 'WhatsApp message sent successfully'
        };
      } else {
        console.error(`❌ WATI API error for ${whatsappNumber}:`, data);
        return {
          success: false,
          error: data.message || data.error || 'Failed to send WhatsApp message'
        };
      }
    } catch (error) {
      console.error(`❌ WATI service error for ${whatsappNumber}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Send pipeline message (initial order confirmation)
   */
  async sendPipelineMessage(orderData: OrderData): Promise<WATIResponse> {
    const templateMessage: WATITemplateMessage = {
      template_name: WATI_CONFIG.TEMPLATES.PIPELINE_MESSAGE,
      parameters: [
        { name: 'name', value: orderData.customerName },
        { name: 'order_id', value: orderData.orderId },
        { name: 'order_amount', value: orderData.orderAmount.toString() }, // Remove ₹ symbol
        { name: 'address', value: orderData.address },
        { name: 'service_details', value: orderData.serviceDetails },
        { name: 'fees', value: orderData.fees },
        { name: 'date', value: formatDateForWATI(orderData.serviceDate) }, // Use formatted date
        { name: 'slot', value: orderData.timeSlot }
      ],
      broadcast_name: WATI_CONFIG.BROADCASTS.PIPELINE
    };

    return this.sendTemplateMessage(orderData.customerPhone, templateMessage);
  }

  /**
   * Send final confirmation message
   */
  async sendFinalConfirmationMessage(orderData: OrderData): Promise<WATIResponse> {
    const templateMessage: WATITemplateMessage = {
      template_name: WATI_CONFIG.TEMPLATES.FINAL_CONFIRMATION,
      parameters: [
        { name: 'order_id', value: orderData.orderId },
        { name: 'pending_payment', value: (orderData.pendingPayment || 0).toString() }, // Remove ₹ symbol
        { name: 'service_details', value: orderData.serviceDetails },
        { name: 'date', value: formatDateForWATI(orderData.serviceDate) }, // Use formatted date
        { name: 'slot', value: orderData.timeSlot },
        { name: 'Unique_ID', value: orderData.otp || 'N/A' }
      ],
      broadcast_name: WATI_CONFIG.BROADCASTS.FINAL
    };

    return this.sendTemplateMessage(orderData.customerPhone, templateMessage);
  }

  /**
   * Send partner assignment message
   */
  async sendPartnerMessage(partnerOrderData: PartnerOrderData): Promise<WATIResponse> {
    const templateMessage: WATITemplateMessage = {
      template_name: WATI_CONFIG.TEMPLATES.PARTNER_MESSAGE,
      parameters: [
        { name: 'name', value: partnerOrderData.customerName },
        { name: 'order_id', value: partnerOrderData.orderId },
        { name: 'order_amount', value: partnerOrderData.orderAmount.toString() },
        { name: 'address', value: partnerOrderData.address },
        { name: 'service_details', value: partnerOrderData.serviceDetails },
        { name: 'fees', value: partnerOrderData.fees },
        { name: 'date', value: formatDateForWATI(partnerOrderData.serviceDate) },
        { name: 'slot', value: partnerOrderData.timeSlot },
        { name: 'pending_payment', value: partnerOrderData.pendingPayment.toString() },
        { name: 'Unique_ID', value: partnerOrderData.otp },
        { name: 'responsible_person', value: partnerOrderData.responsiblePerson }
      ],
      broadcast_name: WATI_CONFIG.BROADCASTS.FINAL
    };

    return this.sendTemplateMessage(partnerOrderData.partnerPhone, templateMessage);
  }

  /**
   * Send partner reassignment message (using same template as regular assignment)
   */
  async sendPartnerReassignmentMessage(partnerReassignmentData: PartnerReassignmentData): Promise<WATIResponse> {
    // Use the same template as regular partner assignment
    // The template will work for both first-time and reassignment cases
    const templateMessage: WATITemplateMessage = {
      template_name: WATI_CONFIG.TEMPLATES.PARTNER_MESSAGE,
      parameters: [
        { name: 'name', value: partnerReassignmentData.customerName },
        { name: 'order_id', value: partnerReassignmentData.orderId },
        { name: 'order_amount', value: partnerReassignmentData.orderAmount.toString() },
        { name: 'address', value: partnerReassignmentData.address },
        { name: 'service_details', value: partnerReassignmentData.serviceDetails },
        { name: 'fees', value: partnerReassignmentData.fees },
        { name: 'date', value: formatDateForWATI(partnerReassignmentData.serviceDate) },
        { name: 'slot', value: partnerReassignmentData.timeSlot },
        { name: 'pending_payment', value: partnerReassignmentData.pendingPayment.toString() },
        { name: 'Unique_ID', value: partnerReassignmentData.otp },
        { name: 'responsible_person', value: partnerReassignmentData.responsiblePerson }
        // Note: Not including previous_partner since the template doesn't support it
      ],
      broadcast_name: WATI_CONFIG.BROADCASTS.FINAL
    };

    return this.sendTemplateMessage(partnerReassignmentData.partnerPhone, templateMessage);
  }

  /**
   * Format phone number for WhatsApp (ensure it starts with country code)
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 91 (India), return as is
    if (cleaned.startsWith('91')) {
      return cleaned;
    }
    
    // If it starts with 0, replace with 91
    if (cleaned.startsWith('0')) {
      return '91' + cleaned.substring(1);
    }
    
    // If it's 10 digits, add 91 prefix
    if (cleaned.length === 10) {
      return '91' + cleaned;
    }
    
    // Return as is if already formatted
    return cleaned;
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    // WhatsApp numbers should be 10-15 digits with country code
    return /^\d{10,15}$/.test(formatted);
  }
}

// Export singleton instance
export const watiService = new WATIService();
