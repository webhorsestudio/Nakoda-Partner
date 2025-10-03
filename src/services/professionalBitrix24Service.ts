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
          "UF_CRM_1681645659170", // Customer name
          "UF_CRM_1681974166046", // Mobile number
          "UF_CRM_1681649038953", // Order number
          "UF_CRM_1681648179537", // Amount & currency
          "UF_CRM_1681749732453", // Package & partner
          "UF_CRM_1681648036958", // Service date
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
   * Transform Bitrix24 deal to order data
   */
  transformDealToOrder(deal: Bitrix24Deal): CreateOrderData {
    // Implementation remains the same as original
    const customerName = deal.UF_CRM_1681645659170 || 'Unknown Customer';
    const mobileNumber = deal.UF_CRM_1681974166046 || '';
    const orderNumber = deal.UF_CRM_1681649038953 || '';
    const amountCurrency = deal.UF_CRM_1681648179537 || '0|INR';
    const packagePartner = deal.UF_CRM_1681749732453 || '';
    const serviceDate = deal.UF_CRM_1681648036958 || '';

    const [amount, currency] = amountCurrency.split('|');
    const [packageName, partnerName] = packagePartner.split(' By : ');

    return {
      bitrix24_id: deal.ID,
      title: deal.TITLE || 'Unknown Order',
      order_number: orderNumber,
      customer_name: customerName,
      mobile_number: mobileNumber,
      service_type: packageName || 'Unknown Service',
      partner: partnerName || 'Unknown Partner',
      amount: parseFloat(amount) || 0,
      currency: currency || 'INR',
      status: deal.STAGE_ID === 'C2:PREPAYMENT_INVOICE' ? 'pending' : 'in_progress',
      service_date: serviceDate ? new Date(serviceDate).toISOString() : new Date().toISOString(),
      date_created: new Date(deal.DATE_CREATE).toISOString(),
      date_modified: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const professionalBitrix24Service = new ProfessionalBitrix24Service();
