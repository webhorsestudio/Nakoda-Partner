export interface Bitrix24Deal {
  ID: string;
  TITLE: string;
  TYPE_ID: string;
  STAGE_ID: string;
  PROBABILITY: string | null;
  CURRENCY_ID: string;
  OPPORTUNITY: string;
  IS_MANUAL_OPPORTUNITY: string;
  TAX_VALUE: string | null;
  LEAD_ID: string;
  COMPANY_ID: string;
  CONTACT_ID: string;
  QUOTE_ID: string | null;
  BEGINDATE: string;
  CLOSEDATE: string;
  ASSIGNED_BY_ID: string;
  CREATED_BY_ID: string;
  MODIFY_BY_ID: string;
  DATE_CREATE: string;
  DATE_MODIFY: string;
  OPENED: string;
  CLOSED: string;
  COMMENTS: string | null;
  ADDITIONAL_INFO: string | null;
  LOCATION_ID: string | null;
  CATEGORY_ID: string;
  STAGE_SEMANTIC_ID: string;
  IS_NEW: string;
  IS_RECURRING: string;
  IS_RETURN_CUSTOMER: string;
  IS_REPEATED_APPROACH: string;
  SOURCE_ID: string | null;
  SOURCE_DESCRIPTION: string | null;
  ORIGINATOR_ID: string | null;
  ORIGIN_ID: string | null;
  MOVED_BY_ID: string;
  MOVED_TIME: string;
  LAST_ACTIVITY_TIME: string;
  UTM_SOURCE: string | null;
  UTM_MEDIUM: string | null;
  UTM_CAMPAIGN: string | null;
  UTM_CONTENT: string | null;
  UTM_TERM: string | null;
  LAST_COMMUNICATION_TIME: string | null;
  LAST_ACTIVITY_BY: string;
}

export interface Bitrix24Response {
  result: Bitrix24Deal[];
  next: number;
  total: number;
  time: {
    start: number;
    finish: number;
    duration: number;
    processing: number;
    date_start: string;
    date_finish: string;
    operating_reset_at: number;
    operating: number;
  };
}

export interface Order {
  id: string;
  bitrix24_id: string;
  title: string;
  
  // Parsed fields from title
  mode?: string;
  package?: string;
  order_number?: string;
  mobile_number?: string;
  order_date?: string;
  order_time?: string;
  customer_name?: string;
  address?: string;
  city?: string;
  pin_code?: string;
  
  // Original fields
  service_type: string | null;
  specification: string | null;
  stage_id: string | null;
  stage_semantic_id: string | null;
  status: string;
  currency: string;
  amount: number | string;
  lead_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  assigned_by_id: string | null;
  created_by_id: string | null;
  begin_date: string | null;
  close_date: string | null;
  date_created: string | null;
  date_modified: string | null;
  is_closed: boolean;
  is_new: boolean;
  comments: string | null;
  additional_info: string | null;
  location_id: string | null;
  category_id: string | null;
  source_id: string | null;
  source_description: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  last_activity_time: string | null;
  last_activity_by: string | null;
  last_communication_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  bitrix24_id: string;
  title: string;
  
  // Parsed fields from title
  mode?: string;
  package?: string;
  order_number?: string;
  mobile_number?: string;
  order_date?: string;
  order_time?: string;
  customer_name?: string;
  address?: string;
  city?: string;
  pin_code?: string;
  
  // Original fields
  service_type?: string;
  specification?: string;
  stage_id?: string;
  stage_semantic_id?: string;
  status?: string;
  currency?: string;
  amount?: number | string;
  lead_id?: string;
  contact_id?: string;
  company_id?: string;
  assigned_by_id?: string;
  created_by_id?: string;
  begin_date?: string;
  close_date?: string;
  date_created?: string;
  date_modified?: string;
  is_closed?: boolean;
  is_new?: boolean;
  comments?: string;
  additional_info?: string;
  location_id?: string;
  category_id?: string;
  source_id?: string;
  source_description?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  last_activity_time?: string;
  last_activity_by?: string;
  last_communication_time?: string;
}

export interface UpdateOrderData {
  title?: string;
  service_type?: string;
  specification?: string;
  stage_id?: string;
  stage_semantic_id?: string;
  status?: string;
  currency?: string;
  amount?: number | string;
  lead_id?: string;
  contact_id?: string;
  company_id?: string;
  assigned_by_id?: string;
  created_by_id?: string;
  begin_date?: string;
  close_date?: string;
  date_created?: string;
  date_modified?: string;
  is_closed?: boolean;
  is_new?: boolean;
  comments?: string;
  additional_info?: string;
  location_id?: string;
  category_id?: string;
  source_id?: string;
  source_description?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  last_activity_time?: string;
  last_activity_by?: string;
  last_communication_time?: string;
}

export interface OrderStats {
  total_orders: number;
  completed_orders: number;
  in_progress_orders: number;
  new_orders: number;
  total_revenue: number;
  average_order_value: number;
}

export interface OrderFilters {
  search?: string;
  status?: string;
  service_type?: string;
  stage_id?: string;
  assigned_by_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}
