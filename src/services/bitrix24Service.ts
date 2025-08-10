import { Bitrix24Deal, Bitrix24Response, CreateOrderData } from "@/types/orders";

const BITRIX24_BASE_URL = process.env.NEXT_PUBLIC_BITRIX24_BASE_URL || "https://b24-xx9d8g.bitrix24.in";
const BITRIX24_REST_URL = process.env.NEXT_PUBLIC_BITRIX24_REST_URL || "/rest/16834/pir861c5pn9rhbcg";

class Bitrix24Service {
  private baseUrl: string;
  private restUrl: string;

  constructor() {
    this.baseUrl = BITRIX24_BASE_URL;
    this.restUrl = BITRIX24_REST_URL;
    
    // Debug environment variables
    console.log("Bitrix24 Environment Check:");
    console.log("BASE_URL:", this.baseUrl);
    console.log("REST_URL:", this.restUrl);
  }

  /**
   * Sleep function to add delays between requests
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetch deals from Bitrix24 API with correct POST format
   */
  async fetchDeals(start: number = 0, limit: number = 50, retryCount: number = 0): Promise<Bitrix24Response> {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second base delay

    try {
      const url = `${this.baseUrl}${this.restUrl}/crm.deal.list.json`;
      
      // Use the correct POST format with filters
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
          "UTM_TERM", "LAST_ACTIVITY_TIME", "LAST_ACTIVITY_BY", "LAST_COMMUNICATION_TIME"
        ],
        start: start,
        limit: limit
      };

      console.log(`Making POST request to Bitrix24 API with body:`, JSON.stringify(requestBody, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.status === 429) {
        // Rate limited - wait and retry
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Rate limited (429). Waiting ${delay}ms before retry ${retryCount + 1}/${maxRetries}...`);
        await this.sleep(delay);
        
        if (retryCount < maxRetries) {
          return this.fetchDeals(start, limit, retryCount + 1);
        } else {
          throw new Error(`Bitrix24 API rate limit exceeded after ${maxRetries} retries`);
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Bitrix24 API Error Response:", errorText);
        throw new Error(`Bitrix24 API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: Bitrix24Response = await response.json();
      console.log(`Successfully fetched ${data.result?.length || 0} deals from Bitrix24`);
      return data;
    } catch (error) {
      console.error("Error fetching Bitrix24 deals:", error);
      throw error;
    }
  }

  /**
   * Test connection to Bitrix24 API
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log("Testing Bitrix24 API connection...");
      const url = `${this.baseUrl}${this.restUrl}/crm.deal.list.json`;
      
      const requestBody = {
        filter: {
          LOGIC: "OR",
          "0": { "STAGE_ID": "C2:PREPAYMENT_INVOICE" },
          "1": { "STAGE_ID": "C2:EXECUTING" }
        },
        order: { "DATE_CREATE": "DESC" },
        select: ["ID", "TITLE", "DATE_CREATE"],
        start: 0,
        limit: 1
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Bitrix24 API connection successful");
        console.log("Total deals available:", data.total || "Unknown");
        return true;
      } else {
        console.error("Bitrix24 API connection failed:", response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error("Error testing Bitrix24 connection:", error);
      return false;
    }
  }

  /**
   * Fetch recent deals with smart pagination and rate limiting
   */
  async fetchRecentDealsWithFallback(): Promise<Bitrix24Deal[]> {
    try {
      console.log("Fetching recent deals from Bitrix24 with proper stage filters...");
      
      const recentDeals: Bitrix24Deal[] = [];
      let start = 0;
      const limit = 50;
      let totalFetched = 0;
      let consecutiveEmptyBatches = 0;
      const maxBatches = 20; // Maximum 20 batches (1000 deals)
      
      // Fetch deals in smaller batches with delays
      while (totalFetched < 1000 && consecutiveEmptyBatches < 5) {
        console.log(`Fetching batch starting at ${start}...`);
        
        const response = await this.fetchDeals(start, limit);
        const deals = response.result;
        
        if (deals.length === 0) {
          console.log("No more deals to fetch");
          consecutiveEmptyBatches++;
        } else {
          consecutiveEmptyBatches = 0;
        }
        
        totalFetched += deals.length;
        recentDeals.push(...deals);
        
        console.log(`Batch ${Math.floor(start/limit) + 1}: ${deals.length} deals`);
        
        // Stop if we've had 5 consecutive empty batches
        if (consecutiveEmptyBatches >= 5) {
          console.log(`Stopping: Found ${recentDeals.length} deals, but ${consecutiveEmptyBatches} consecutive empty batches.`);
          break;
        }
        
        // Add delay between requests to avoid rate limiting
        await this.sleep(200);
        
        start += limit;
      }
      
      console.log(`Successfully fetched ${recentDeals.length} deals from ${totalFetched} total requests`);
      
      return recentDeals;
    } catch (error) {
      console.error("Error in fetchRecentDealsWithFallback:", error);
      throw error;
    }
  }

  /**
   * Transform Bitrix24 deal to our order format
   */
  transformDealToOrder(deal: Bitrix24Deal): CreateOrderData {
    const title = deal.TITLE;

    // Extract all fields using regex patterns that match the actual format
    // Format: "Mode : Cod,Package :AC Service Repair Power Jet AC Service (1 AC) By : OM Cooling Centre,Order : Nu..."
    const modeMatch = title.match(/Mode\s*:\s*([^,]+?)(?=,|$)/);
    const packageMatch = title.match(/Package\s*:\s*([^,]+?)(?=,|$)/);
    const orderMatch = title.match(/Order\s*:\s*([^,]+?)(?=,|$)/);
    const mobileMatch = title.match(/Mb\s*:\s*(\d+)/);
    const dateMatch = title.match(/Date\s*:\s*([^,]+?)(?=Time|,|$)/);
    const timeMatch = title.match(/Time\s*:\s*([^,]+?)(?=,|$)/);
    const orderTotalMatch = title.match(/Order Total\s*:\s*([^,]+?)(?=,|$)/);
    const nameMatch = title.match(/By\s*:\s*([^,]+?)(?=,|$)/); // Changed from "Name" to "By"
    const addressMatch = title.match(/Address\s*:\s*([^,]+?)(?=,|$)/); // Changed from "Addr" to "Address"
    const cityMatch = title.match(/City\s*:\s*([^,]+?)(?=,|$)/);
    const pinMatch = title.match(/Pin\s*:\s*([^,]+?)(?=,|$)/); // Improved to capture any characters until comma or end
    
    // Extract values
    const mode = modeMatch ? modeMatch[1].trim() : undefined;
    const packageName = packageMatch ? packageMatch[1].trim() : undefined;
    const order_number = orderMatch ? orderMatch[1].trim() : undefined;
    const mobile_number = mobileMatch ? mobileMatch[1].trim() : undefined;
    const order_date = dateMatch ? dateMatch[1].trim() : undefined;
    const order_time = timeMatch ? timeMatch[1].trim() : undefined;
    const orderTotal = orderTotalMatch ? orderTotalMatch[1].trim() : undefined;
    const customer_name = nameMatch ? nameMatch[1].trim() : undefined;
    const address = addressMatch ? addressMatch[1].trim() : undefined;
    const city = cityMatch ? cityMatch[1].trim() : undefined;
    const pin_code = pinMatch ? pinMatch[1].trim() : undefined;

    console.log(`Original title for order ${deal.ID}:`, title);
    console.log(`Parsed fields for order ${deal.ID}:`, {
      mode,
      package: packageName,
      order_number,
      mobile_number,
      order_date,
      order_time,
      orderTotal,
      customer_name,
      address,
      city,
      pin_code
    });

    // Map stage to status
    const status = this.mapStageToStatus(deal.STAGE_ID);

    return {
      bitrix24_id: deal.ID,
      title: deal.TITLE,
      
      // Parsed fields
      mode,
      package: packageName,
      order_number,
      mobile_number,
      order_date,
      order_time,
      customer_name,
      address,
      city,
      pin_code,
      
      // Original fields
      service_type: packageName, // Use package as service_type
      specification: packageName, // Use package as specification
      stage_id: deal.STAGE_ID,
      stage_semantic_id: deal.STAGE_SEMANTIC_ID,
      status,
      currency: deal.CURRENCY_ID,
      amount: orderTotal ? parseFloat(orderTotal.replace(/[^\d.]/g, '')) : (parseFloat(deal.OPPORTUNITY) || 0),
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
      last_communication_time: deal.LAST_COMMUNICATION_TIME || undefined,
    };
  }

  /**
   * Map Bitrix24 stage to our status
   */
  private mapStageToStatus(stageId: string): string {
    switch (stageId) {
      case "NEW":
        return "new";
      case "UC_KGG7AX":
      case "UC_G0NPM8":
      case "C2:PREPAYMENT_INVOICE":
      case "C2:EXECUTING":
        return "in_progress";
      case "WON":
      case "UC_8R9V9D":
        return "completed";
      case "LOSE":
      case "UC_2J0HF6":
        return "cancelled";
      default:
        return "pending";
    }
  }

  /**
   * Fetch deals by date range (legacy method - kept for reference)
   */
  async fetchDealsByDateRange(startDate: string, endDate: string): Promise<Bitrix24Deal[]> {
    try {
      const url = `${this.baseUrl}${this.restUrl}/crm.deal.list.json`;
      const params = new URLSearchParams({
        filter: JSON.stringify([
          { ">=DATE_CREATE": startDate },
          { "<=DATE_CREATE": endDate }
        ]),
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Bitrix24 API error: ${response.status} ${response.statusText}`);
      }

      const data: Bitrix24Response = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error fetching deals by date range:", error);
      throw error;
    }
  }

  /**
   * Fetch single deal by ID
   */
  async fetchDealById(dealId: string): Promise<Bitrix24Deal | null> {
    try {
      const url = `${this.baseUrl}${this.restUrl}/crm.deal.get.json`;
      const params = new URLSearchParams({
        id: dealId,
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Bitrix24 API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error fetching deal by ID:", error);
      throw error;
    }
  }
}

export const bitrix24Service = new Bitrix24Service();
