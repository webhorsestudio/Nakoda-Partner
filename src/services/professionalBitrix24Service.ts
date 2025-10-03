import { Bitrix24Deal, Bitrix24Response, CreateOrderData } from "@/types/orders";
import { bitrix24CircuitBreaker } from "@/lib/circuitBreaker";
import { bitrix24RateLimiter } from "@/lib/rateLimiter";

const BITRIX24_BASE_URL = process.env.NEXT_PUBLIC_BITRIX24_BASE_URL || "https://b24-xx9d8g.bitrix24.in";
const BITRIX24_REST_URL = process.env.NEXT_PUBLIC_BITRIX24_REST_URL || "/rest/16834/pir861c5pn9rhbcg";

/**
 * Professional Bitrix24 Service with Circuit Breaker and Intelligent Rate Limiting
 */
class ProfessionalBitrix24Service {
  private baseUrl: string;
  private restUrl: string;

  constructor() {
    this.baseUrl = BITRIX24_BASE_URL;
    this.restUrl = BITRIX24_REST_URL;
    console.log('🏢 Professional Bitrix24 Service: Initialized');
  }

  /**
   * Fetch deals with intelligent rate limiting and circuit breaker protection
   */
  async fetchDeals(start: number = 0, limit: number = 10): Promise<Bitrix24Response> {
    return await bitrix24CircuitBreaker.execute(async () => {
      // Wait for rate limiter
      await bitrix24RateLimiter.waitForNextRequest();
      
      const url = `${this.baseUrl}${this.restUrl}/crm.deal.list.json`;
      
      // Optimized request body with essential fields only
      const requestBody = {
        filter: {
          LOGIC: "OR",
          "0": { "STAGE_ID": "C2:PREPAYMENT_INVOICE" },
          "1": { "STAGE_ID": "C2:EXECUTING" }
        },
        order: { "DATE_CREATE": "DESC" },
        select: [
          "ID", "TITLE", "OPPORTUNITY", "CURRENCY_ID", "DATE_CREATE", "STAGE_ID",
          "STAGE_SEMANTIC_ID", "LEAD_ID", "CONTACT_ID", "COMPANY_ID", "ASSIGNED_BY_ID",
          "CREATED_BY_ID", "BEGINDATE", "CLOSEDATE", "DATE_MODIFY", "CLOSED", "IS_NEW",
          "COMMENTS", "ADDITIONAL_INFO", "LOCATION_ID", "CATEGORY_ID", "SOURCE_ID",
          "SOURCE_DESCRIPTION", "UTM_SOURCE", "UTM_MEDIUM", "UTM_CAMPAIGN", "UTM_CONTENT",
          "UTM_TERM", "LAST_ACTIVITY_TIME", "LAST_ACTIVITY_BY", "LAST_COMMUNICATION_TIME",
          // Rich custom fields for complete information
          "UF_CRM_1681747087033", // Full address: "Plot no :192,Dibbapalem r h colony, Srinagar,gajuwaka, Visakhapatnam , 530026, "
          "UF_CRM_1681645659170", // Customer name: "Gayathri"
          "UF_CRM_1681974166046", // Mobile number: "6305170127"
          "UF_CRM_1681649038953", // Order number: "Nus87638"
          "UF_CRM_1681648179537", // Amount & currency: "510|INR"
          "UF_CRM_1681749732453", // Package & partner: "Intense Cleaning 1 Bathroom By : Pams Facility Management Services"
          "UF_CRM_1681648036958", // Service Date and Time Slot: "2025-08-12T03:00:00+03:00"
          "UF_CRM_1681647842342", // Order time: "2918" (time slot)
          "UF_CRM_1681648200083", // Commission(%): "25"
          "UF_CRM_1681648220910", // Additional info: "1"
          "UF_CRM_1681648284105", // Advance Amount: "1000"
          "UF_CRM_1723904458952", // Taxes and Fee: "150"
          "UF_CRM_1681747291577", // Service Slot Time: "4972", "4974", "4976", etc.
        ],
        start,
        limit
      };

      console.log(`📡 Bitrix24: Fetching ${limit} deals starting from ${start}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.status === 429) {
        bitrix24RateLimiter.onRateLimit();
        throw new Error('Rate limit exceeded');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Bitrix24 API Error:", response.status, errorText);
        bitrix24RateLimiter.onError();
        throw new Error(`Bitrix24 API error: ${response.status} ${response.statusText}`);
      }

      const data: Bitrix24Response = await response.json();
      bitrix24RateLimiter.onSuccess();
      
      console.log(`✅ Bitrix24: Successfully fetched ${data.result?.length || 0} deals`);
      return data;
    });
  }

  /**
   * Fetch recent deals with intelligent pagination
   */
  async fetchRecentDealsWithFallback(): Promise<Bitrix24Deal[]> {
    try {
      console.log('🔄 Bitrix24: Starting intelligent fetch...');
      
      const deals: Bitrix24Deal[] = [];
      let start = 0;
      const limit = 10;
      let totalFetched = 0;
      const maxDeals = 50; // Reasonable limit
      
      // Fetch in small batches with intelligent delays
      while (totalFetched < maxDeals) {
        const response = await this.fetchDeals(start, limit);
        const batchDeals = response.result || [];
        
        if (batchDeals.length === 0) {
          console.log('📭 Bitrix24: No more deals found, stopping');
          break;
        }
        
        deals.push(...batchDeals);
        totalFetched += batchDeals.length;
        start += limit;
        
        console.log(`📊 Bitrix24: Fetched ${totalFetched} deals so far`);
        
        // If we got fewer deals than requested, we've reached the end
        if (batchDeals.length < limit) {
          break;
        }
      }
      
      console.log(`✅ Bitrix24: Fetch completed, total deals: ${deals.length}`);
      return deals;
      
    } catch (error) {
      console.error("❌ Bitrix24: Fetch failed:", error);
      
      // Return empty array instead of throwing to prevent system failure
      console.log('🔄 Bitrix24: Returning empty array to maintain system stability');
      return [];
    }
  }

  /**
   * Get service health status
   */
  getHealthStatus(): {
    circuitBreakerState: string;
    rateLimiterStats: { delay: number; successes: number; failures: number };
    isHealthy: boolean;
  } {
    const circuitState = bitrix24CircuitBreaker.getState();
    const rateLimiterStats = bitrix24RateLimiter.getStats();
    
    return {
      circuitBreakerState: circuitState,
      rateLimiterStats,
      isHealthy: circuitState !== 'OPEN'
    };
  }

  /**
   * Transform Bitrix24 deal to order data with complete field mapping
   */
  transformDealToOrder(deal: Bitrix24Deal): CreateOrderData {
    // Use rich custom fields instead of parsing incomplete TITLE
    const richAddress = deal.UF_CRM_1681747087033;
    const customerName = deal.UF_CRM_1681645659170 || 'Unknown Customer';
    const mobileNumber = deal.UF_CRM_1681974166046 || '';
    const orderNumber = deal.UF_CRM_1681649038953 || '';
    const amountCurrency = deal.UF_CRM_1681648179537 || '0|INR';
    const packagePartner = deal.UF_CRM_1681749732453 || '';
    const serviceDate = deal.UF_CRM_1681648036958 || '';
    const orderTime = deal.UF_CRM_1681647842342 || '';
    const commissionPercentage = deal.UF_CRM_1681648200083 || '';
    const additionalInfo = deal.UF_CRM_1681648220910 || '';
    const advanceAmount = deal.UF_CRM_1681648284105 || '';
    const taxesAndFees = deal.UF_CRM_1723904458952 || '';
    const serviceSlotTime = deal.UF_CRM_1681747291577 || '';

    // Parse amount and currency
    const [amount, currency] = amountCurrency.split('|');
    const numericAmount = parseFloat(amount) || 0;

    // Parse package and partner
    const [packageName, partnerName] = packagePartner.split(' By : ');

    // Parse address components
    let address = '';
    let city = '';
    let pin_code = '';
    
    if (richAddress) {
      // Parse address: "Plot no :192,Dibbapalem r h colony, Srinagar,gajuwaka, Visakhapatnam , 530026, "
      const addressParts = richAddress.split(',').map(part => part.trim());
      
      // Extract pin code (last numeric part)
      const pinCodeMatch = richAddress.match(/(\d{6})/);
      if (pinCodeMatch) {
        pin_code = pinCodeMatch[1];
      }
      
      // Extract city (usually the last meaningful part before pin code)
      if (addressParts.length >= 2) {
        city = addressParts[addressParts.length - 2] || '';
      }
      
      // Address is the full string minus pin code
      address = richAddress.replace(/\s*\d{6}\s*,?\s*$/, '').trim();
    }

    // Parse order date and time
    const orderDate = serviceDate ? new Date(serviceDate).toLocaleDateString() : '';
    const finalOrderTime = orderTime || serviceSlotTime || '';

    // Map stage to status
    const status = this.mapStageToStatus(deal.STAGE_ID);

    return {
      bitrix24_id: deal.ID,
      title: deal.TITLE,
      
      // Rich parsed fields from custom fields
      mode: 'online', // Default mode
      package: packageName || 'Unknown Package',
      partner: partnerName || 'Unknown Partner',
      order_number: orderNumber,
      mobile_number: mobileNumber,
      order_date: orderDate,
      order_time: finalOrderTime,
      customer_name: customerName,
      address,
      city,
      pin_code,
      
      // Financial and service fields
      commission_percentage: commissionPercentage,
      advance_amount: advanceAmount,
      taxes_and_fees: taxesAndFees,
      service_date: serviceDate,
      time_slot: finalOrderTime,
      
      // Original fields
      service_type: packageName || 'Unknown Service',
      specification: packageName,
      stage_id: deal.STAGE_ID,
      stage_semantic_id: deal.STAGE_SEMANTIC_ID,
      status,
      currency: currency || 'INR',
      amount: numericAmount,
      lead_id: deal.LEAD_ID || undefined,
      contact_id: deal.CONTACT_ID || undefined,
      company_id: deal.COMPANY_ID || undefined,
      assigned_by_id: deal.ASSIGNED_BY_ID || undefined,
      created_by_id: deal.CREATED_BY_ID || undefined,
      begin_date: deal.BEGINDATE || undefined,
      close_date: deal.CLOSEDATE || undefined,
      date_created: deal.DATE_CREATE,
      date_modified: deal.DATE_MODIFY,
      is_closed: deal.CLOSED === "Y",
      is_new: deal.IS_NEW === "Y",
      comments: deal.COMMENTS || undefined,
      additional_info: deal.ADDITIONAL_INFO || undefined,
      location_id: deal.LOCATION_ID || undefined,
      category_id: deal.CATEGORY_ID || undefined,
      source_id: deal.SOURCE_ID || undefined,
      source_description: deal.SOURCE_DESCRIPTION || undefined,
      utm_source: deal.UTM_SOURCE || undefined,
      utm_medium: deal.UTM_MEDIUM || undefined,
      utm_campaign: deal.UTM_CAMPAIGN || undefined,
      utm_content: deal.UTM_CONTENT || undefined,
      utm_term: deal.UTM_TERM || undefined,
      last_activity_time: deal.LAST_ACTIVITY_TIME || undefined,
      last_activity_by: deal.LAST_ACTIVITY_BY || undefined,
      last_communication_time: deal.LAST_COMMUNICATION_TIME || undefined
    };
  }

  /**
   * Map Bitrix24 stage to order status
   */
  private mapStageToStatus(stageId: string): string {
    switch (stageId) {
      case 'C2:PREPAYMENT_INVOICE':
        return 'pending';
      case 'C2:EXECUTING':
        return 'in_progress';
      case 'C2:FINAL_INVOICE':
        return 'completed';
      case 'C2:WON':
        return 'completed';
      case 'C2:LOSE':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}

// Export singleton instance
export const professionalBitrix24Service = new ProfessionalBitrix24Service();
