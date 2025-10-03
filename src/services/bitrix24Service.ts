import { Bitrix24Deal, Bitrix24Response, CreateOrderData } from "@/types/orders";

const BITRIX24_BASE_URL = process.env.NEXT_PUBLIC_BITRIX24_BASE_URL || "https://b24-xx9d8g.bitrix24.in";
const BITRIX24_REST_URL = process.env.NEXT_PUBLIC_BITRIX24_REST_URL || "/rest/16834/pir861c5pn9rhbcg";

class Bitrix24Service {
  private baseUrl: string;
  private restUrl: string;

  constructor() {
    this.baseUrl = BITRIX24_BASE_URL;
    this.restUrl = BITRIX24_REST_URL;
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
    const maxRetries = 5; // Increased retries
    const baseDelay = 2000; // 2 second base delay (more conservative)

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
          "UTM_TERM", "LAST_ACTIVITY_TIME", "LAST_ACTIVITY_BY", "LAST_COMMUNICATION_TIME",
          // Rich custom fields for complete information
          "UF_CRM_1681747087033", // Full address: "Plot no :192,Dibbapalem r h colony, Srinagar,gajuwaka, Visakhapatnam , 530026, "
          "UF_CRM_1681645659170", // Customer name: "Gayathri"
          "UF_CRM_1681974166046", // Mobile number: "6305170127"
          "UF_CRM_1681649038953", // Order number: "Nus87638"
          "UF_CRM_1681648179537", // Amount & currency: "510|INR"
          "UF_CRM_1681749732453", // Package & partner: "Intense Cleaning 1 Bathroom By : Pams Facility Management Services"
          "UF_CRM_1681648036958", // Service date: "2025-08-12T03:00:00+03:00"
          "UF_CRM_1681647842342", // Order time: "2918" (time slot)
          "UF_CRM_1681747291577", // Service slot time: "4972", "4974", etc.
          "UF_CRM_1681648200083", // Commission(%): "25"
          "UF_CRM_1681648220910", // Additional info: "1"
          "UF_CRM_1681648284105", // Advance Amount: "1000"
          "UF_CRM_1723904458952"  // Taxes and Fee: "150"
        ],
        start: start,
        limit: limit
      };

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
      const url = `${this.baseUrl}${this.restUrl}/crm.deal.list.json`;
      
      const requestBody = {
        filter: {
          LOGIC: "OR",
          "0": { "STAGE_ID": "C2:PREPAYMENT_INVOICE" },
          "1": { "STAGE_ID": "C2:EXECUTING" }
        },
        order: { "DATE_CREATE": "DESC" },
        select: ["ID", "TITLE", "DATE_CREATE", "UF_CRM_1681747087033", "UF_CRM_1681645659170", "UF_CRM_1681747291577"],
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
        return true;
      } else {
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
      const recentDeals: Bitrix24Deal[] = [];
      let start = 0;
      const limit = 25; // Reduced batch size for better rate limiting
      let totalFetched = 0;
      let consecutiveEmptyBatches = 0;
      
      // Fetch deals in smaller batches with delays
      while (totalFetched < 1000 && consecutiveEmptyBatches < 5) {
        // Add initial delay to be extra safe with rate limiting
        if (start === 0) {
          await this.sleep(1000); // 1 second delay before first request
        }
        
        const response = await this.fetchDeals(start, limit);
        const deals = response.result;
        
        if (deals.length === 0) {
          consecutiveEmptyBatches++;
        } else {
          consecutiveEmptyBatches = 0;
        }
        
        totalFetched += deals.length;
        recentDeals.push(...deals);
        
        // Stop if we've had 5 consecutive empty batches
        if (consecutiveEmptyBatches >= 5) {
          break;
        }
        
        // Add delay between requests to avoid rate limiting (Bitrix24 allows 2 requests per second = 500ms minimum)
        await this.sleep(500);
        
        start += limit;
      }
      
      return recentDeals;
    } catch (error) {
      console.error("Error in fetchRecentDealsWithFallback:", error);
      throw error;
    }
  }



  /**
   * Safely truncate string values to fit database column limits
   */
  private safeTruncate(value: string | undefined | null, maxLength: number, fieldName: string): string | undefined {
    if (!value) return undefined;
    
    if (value.length > maxLength) {
      const truncated = value.substring(0, maxLength);
      console.warn(`⚠️ Field "${fieldName}" truncated from ${value.length} to ${maxLength} characters: "${truncated}..."`);
      return truncated;
    }
    
    return value;
  }

  /**
   * Extract partner name from package text using multiple strategies
   */
  private extractPartnerFromPackage(packageText: string): { packageName: string; partner?: string } {
    // Define service terms that help identify when text is part of service description
    const serviceTerms = [
      'cleaning', 'service', 'apartment', 'furnished', 'unfurnished', 
      'bhk', 'sqft', 'deep', 'intense', 'commercial', 'residential',
      'home', 'office', 'kitchen', 'bathroom', 'bedroom', 'living',
      'area', 'space', 'maintenance', 'repair', 'installation'
    ];

    // Strategy 1: Check for explicit "By :" separator
    if (packageText.includes('By :')) {
      const parts = packageText.split('By :');
      if (parts.length === 2) {
        return {
          packageName: parts[0].trim(),
          partner: parts[1].trim()
        };
      }
    }

    // Strategy 2: Look for company names with business suffixes
    const businessSuffixPattern = /\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\s+(?:Solutions|Services|Enterprises|Company|Ltd|Pvt|LLC|Inc|Corp)\s*$/i;
    const businessMatch = packageText.match(businessSuffixPattern);
    
    if (businessMatch) {
      const potentialPartner = businessMatch[1].trim();
      // Check if the potential partner contains service terms that should be excluded
      const isServiceTerm = serviceTerms.some(term => 
        potentialPartner.toLowerCase().includes(term.toLowerCase())
      );
      
      if (!isServiceTerm) {
        return {
          packageName: packageText.replace(businessSuffixPattern, '').trim(),
          partner: potentialPartner
        };
      }
    }

    // Strategy 2.5: Look for company names with business suffixes, but exclude common service words
    const improvedBusinessPattern = /\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\s+(?:Solutions|Services|Enterprises|Company|Ltd|Pvt|LLC|Inc|Corp)\s*$/i;
    const improvedMatch = packageText.match(improvedBusinessPattern);
    
    if (improvedMatch) {
      const potentialPartner = improvedMatch[1].trim();
      // More strict filtering - exclude if any word in the potential partner is a service term
      const partnerWords = potentialPartner.split(' ');
      const hasServiceWords = partnerWords.some(word => 
        serviceTerms.some(term => word.toLowerCase() === term.toLowerCase())
      );
      
      if (!hasServiceWords) {
        return {
          packageName: packageText.replace(improvedBusinessPattern, '').trim(),
          partner: potentialPartner
        };
      }
    }

    // Strategy 2.6: Look for company names that end with business suffixes, but are more than 2 words
    const longCompanyPattern = /\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,})\s+(?:Solutions|Services|Enterprises|Company|Ltd|Pvt|LLC|Inc|Corp)\s*$/i;
    const longCompanyMatch = packageText.match(longCompanyPattern);
    
    if (longCompanyMatch) {
      const potentialPartner = longCompanyMatch[1].trim();
      // For longer company names, check if they contain service terms
      const partnerWords = potentialPartner.split(' ');
      const hasServiceWords = partnerWords.some(word => 
        serviceTerms.some(term => word.toLowerCase() === term.toLowerCase())
      );
      
      if (!hasServiceWords) {
        return {
          packageName: packageText.replace(longCompanyPattern, '').trim(),
          partner: potentialPartner
        };
      }
    }

    // Strategy 2.7: Look for company names that end with "Services" but exclude service terms
    const servicesPattern = /\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Services\s*$/i;
    const servicesMatch = packageText.match(servicesPattern);
    
    if (servicesMatch) {
      const potentialPartner = servicesMatch[1].trim();
      // Check if the potential partner contains service terms
      const partnerWords = potentialPartner.split(' ');
      const hasServiceWords = partnerWords.some(word => 
        serviceTerms.some(term => word.toLowerCase() === term.toLowerCase())
      );
      
      if (!hasServiceWords) {
        return {
          packageName: packageText.replace(servicesPattern, '').trim(),
          partner: potentialPartner + ' Services'
        };
      }
    }

    // Strategy 2.8: Look for company names that start with initials or non-service words and end with Services
    const initialsServicesPattern = /\s+([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Services\s*$/i;
    const initialsMatch = packageText.match(initialsServicesPattern);
    
    if (initialsMatch) {
      const potentialPartner = initialsMatch[1].trim();
      // Check if the first word is a service term
      const firstWord = potentialPartner.split(' ')[0].toLowerCase();
      const isFirstWordServiceTerm = serviceTerms.some(term => term.toLowerCase() === firstWord);
      
      if (!isFirstWordServiceTerm) {
        return {
          packageName: packageText.replace(initialsServicesPattern, '').trim(),
          partner: potentialPartner + ' Services'
        };
      }
    }

    // Strategy 2.9: Look for company names that end with Services but don't start with service terms
    // This is a more sophisticated approach that looks for the last occurrence of a company pattern
    const words = packageText.split(' ');
    for (let i = words.length - 2; i >= 0; i--) {
      if (words[i + 1] === 'Services' || words[i + 1] === 'services') {
        const potentialCompanyWords = words.slice(0, i + 1);
        const potentialCompany = potentialCompanyWords.join(' ');
        
        // Check if the potential company starts with a service term
        const firstWord = potentialCompanyWords[0].toLowerCase();
        const isFirstWordServiceTerm = serviceTerms.some(term => term.toLowerCase() === firstWord);
        
        if (!isFirstWordServiceTerm && potentialCompanyWords.length >= 2) {
          return {
            packageName: words.slice(0, i).join(' ').trim(),
            partner: potentialCompany + ' Services'
          };
        }
      }
    }

    // Strategy 2.10: Look for company names that start with initials (like VK) and end with Services
    const vkServicesPattern = /\s+([A-Z][A-Z]\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Services\s*$/i;
    const vkMatch = packageText.match(vkServicesPattern);
    
    if (vkMatch) {
      const potentialPartner = vkMatch[1].trim();
      return {
        packageName: packageText.replace(vkServicesPattern, '').trim(),
        partner: potentialPartner + ' Services'
      };
    }

    // Strategy 3: Look for company-like names at the end (2+ capitalized words)
    const companyPattern = /\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*$/;
    const companyMatch = packageText.match(companyPattern);
    
    if (companyMatch) {
      const potentialPartner = companyMatch[1].trim();
      const isServiceTerm = serviceTerms.some(term => 
        potentialPartner.toLowerCase().includes(term.toLowerCase())
      );
      
      if (!isServiceTerm && potentialPartner.split(' ').length >= 2) {
        return {
          packageName: packageText.replace(companyPattern, '').trim(),
          partner: potentialPartner
        };
      }
    }

    // Strategy 4: Look for single capitalized words that could be company names
    const singleCompanyPattern = /\s+([A-Z][a-z]+)\s*$/;
    const singleMatch = packageText.match(singleCompanyPattern);
    
    if (singleMatch) {
      const potentialPartner = singleMatch[1].trim();
      const isServiceTerm = serviceTerms.some(term => 
        potentialPartner.toLowerCase().includes(term.toLowerCase())
      );
      
      if (!isServiceTerm) {
        return {
          packageName: packageText.replace(singleCompanyPattern, '').trim(),
          partner: potentialPartner
        };
      }
    }

    // No partner found
    return { packageName: packageText };
  }

  /**
   * Transform Bitrix24 deal to our order format using rich custom fields
   */
  transformDealToOrder(deal: Bitrix24Deal): CreateOrderData {
    // Use rich custom fields instead of parsing incomplete TITLE
    const richAddress = deal.UF_CRM_1681747087033; // Full address: "Plot no :192,Dibbapalem r h colony, Srinagar,gajuwaka, Visakhapatnam , 530026, "
    const customerName = deal.UF_CRM_1681645659170; // Customer name: "Gayathri"
    const mobileNumber = deal.UF_CRM_1681974166046; // Mobile number: "6305170127"
    const orderNumber = deal.UF_CRM_1681649038953; // Order number: "Nus87638"
    const amountCurrency = deal.UF_CRM_1681648179537; // Amount & currency: "510|INR"
    const packagePartner = deal.UF_CRM_1681749732453; // Package & partner: "Intense Cleaning 1 Bathroom By : Pams Facility Management Services"
    const orderDate = deal.UF_CRM_1681648036958; // Service date: "2025-08-12T03:00:00+03:00"
    const orderTime = deal.UF_CRM_1681647842342; // Order time: "2918" (time slot)
    const serviceSlotTime = deal.UF_CRM_1681747291577; // Service slot time: "4972", "4974", etc.
    
    // Extract mode from title (similar to time extraction)
    let extractedMode: string | undefined;
    if (deal.TITLE) {
      const modeMatch = deal.TITLE.match(/Mode\s*:\s*([^,]+?)(?=,|Order Total|$)/i);
      if (modeMatch) {
        const modeValue = modeMatch[1].trim();
        if (modeValue && modeValue.length > 0) {
          extractedMode = modeValue;
        }
      }
    }
    const mode = extractedMode || null;
    
    // New financial and service fields
    const commissionPercentage = deal.UF_CRM_1681648200083; // Commission(%): "25"
    const advanceAmount = deal.UF_CRM_1681648284105; // Advance Amount: "1000"
    const taxesAndFees = deal.UF_CRM_1723904458952; // Taxes and Fee: "150"
    const serviceDate = deal.UF_CRM_1681648036958; // Service Date: "2025-08-12T03:00:00+03:00"

    // Enhanced time slot logic with priority order
    let finalOrderTime: string | undefined;
    
    // Priority 1: Use the dedicated service slot time field if available and valid
    if (serviceSlotTime && serviceSlotTime !== "0" && serviceSlotTime !== "") {
      finalOrderTime = serviceSlotTime;
    }
    // Priority 2: Use the order time field if available and valid
    else if (orderTime && orderTime !== "0" && orderTime !== "") {
      finalOrderTime = orderTime;
    }
    // Priority 3: Extract from title as fallback
    else if (deal.TITLE) {
      const timeMatch = deal.TITLE.match(/Time\s*:\s*([^,]+?)(?=,|Order Total|$)/i);
      if (timeMatch) {
        const extractedTime = timeMatch[1].trim();
        if (extractedTime && extractedTime.length > 0 && !extractedTime.match(/^\s*$/) && extractedTime !== "0") {
          finalOrderTime = extractedTime;
        }
      }
    }

    // Parse the rich address field which contains: "Plot no :192,Dibbapalem r h colony, Srinagar,gajuwaka, Visakhapatnam , 530026, "
    let address: string | undefined;
    let city: string | undefined;
    let pin_code: string | undefined;

    if (richAddress) {
      // Split by commas and extract components
      const parts = richAddress.split(',').map((part: string) => part.trim()).filter((part: string) => part);
      
      if (parts.length >= 3) {
        // First parts are address components
        address = parts.slice(0, -2).join(', ');
        // Second to last is city
        city = parts[parts.length - 2];
        // Last is pin code
        pin_code = parts[parts.length - 1];
      } else if (parts.length === 2) {
        // Only address and city
        address = parts[0];
        city = parts[1];
      } else if (parts.length === 1) {
        // Only address
        address = parts[0];
      }
    }

    // Parse package and partner from the dedicated field
    let packageName: string | undefined;
    let partner: string | undefined;

    if (packagePartner) {
      if (packagePartner.includes('By :')) {
        const [packagePart, partnerPart] = packagePartner.split('By :');
        packageName = packagePart.trim();
        partner = partnerPart.trim();
      } else {
        // Use the extractPartnerFromPackage function to intelligently separate package and partner
        const extracted = this.extractPartnerFromPackage(packagePartner);
        packageName = extracted.packageName;
        partner = extracted.partner;
      }
    }

    // Parse amount and currency
    let amount: number = 0;
    let currency: string = deal.CURRENCY_ID || 'INR';

    if (amountCurrency) {
      if (amountCurrency.includes('|')) {
        const [amountPart, currencyPart] = amountCurrency.split('|');
        amount = parseFloat(amountPart) || parseFloat(deal.OPPORTUNITY) || 0;
        currency = currencyPart || deal.CURRENCY_ID || 'INR';
      } else {
        amount = parseFloat(amountCurrency) || parseFloat(deal.OPPORTUNITY) || 0;
      }
    } else {
      amount = parseFloat(deal.OPPORTUNITY) || 0;
    }

    // Map stage to status
    const status = this.mapStageToStatus(deal.STAGE_ID);

    return {
      bitrix24_id: deal.ID,
      title: deal.TITLE,
      
      // Rich parsed fields from custom fields - with safe truncation
      mode: this.safeTruncate(mode, 50, 'mode'),
      package: this.safeTruncate(packageName, 200, 'package'),
      partner: this.safeTruncate(partner, 200, 'partner'),
      order_number: this.safeTruncate(orderNumber, 50, 'order_number'),
      mobile_number: this.safeTruncate(mobileNumber, 20, 'mobile_number'),
      order_date: this.safeTruncate(orderDate, 100, 'order_date'),
      order_time: this.safeTruncate(finalOrderTime, 100, 'order_time'),
      customer_name: this.safeTruncate(customerName, 200, 'customer_name'),
      address,
      city: this.safeTruncate(city, 100, 'city'),
      pin_code: this.safeTruncate(pin_code, 10, 'pin_code'),
      
      // New financial and service fields
      commission_percentage: commissionPercentage,
      advance_amount: advanceAmount,
      taxes_and_fees: taxesAndFees,
      service_date: serviceDate,
      time_slot: finalOrderTime,
      
      // Original fields - with safe truncation
      service_type: this.safeTruncate(packageName, 100, 'service_type'),
      specification: packageName, // TEXT field, no limit
      stage_id: deal.STAGE_ID,
      stage_semantic_id: deal.STAGE_SEMANTIC_ID,
      status,
      currency,
      amount,
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
      utm_source: this.safeTruncate(deal.UTM_SOURCE || undefined, 100, 'utm_source'),
      utm_medium: this.safeTruncate(deal.UTM_MEDIUM || undefined, 100, 'utm_medium'),
      utm_campaign: this.safeTruncate(deal.UTM_CAMPAIGN || undefined, 100, 'utm_campaign'),
      utm_content: this.safeTruncate(deal.UTM_CONTENT || undefined, 100, 'utm_content'),
      utm_term: this.safeTruncate(deal.UTM_TERM || undefined, 100, 'utm_term'),
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
