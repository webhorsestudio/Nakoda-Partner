// Import Partner type from partners
import { Partner } from './partners';

// Core Service interface (matches database schema)
export interface Service {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Service form data for creating/updating
export interface ServiceFormData {
  name: string;
  description: string;
  is_active: boolean;
}

// Service update data for partial updates
export interface ServiceUpdateData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// Partner Service interface (junction table)
export interface PartnerService {
  id: number;
  partner_id: number;
  service_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  partner?: Partner;
  service?: Service;
}

// Service statistics interface
export interface ServiceStats {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  total_providers: number;
  total_orders: number;
  avg_rating: number;
}

// Partner service overview interface
export interface PartnerServiceOverview {
  partner_id: number;
  partner_name: string;
  mobile: string;
  partner_status: string;
  service_id: number;
  service_name: string;
  service_description: string | null;
  service_active: boolean;
  service_assigned_at: string;
}

// API Response interfaces
export interface ServicesResponse {
  success: boolean;
  data: Service[];
  total: number;
  page?: number;
  error?: string;
}

export interface ServiceResponse {
  success: boolean;
  data: Service | null;
  error?: string;
}

export interface PartnerServicesResponse {
  partnerServices: PartnerService[];
  total: number;
  error?: string;
}

// Service filters interface
export interface ServiceFilters {
  search?: string;
  is_active?: boolean;
}

// Service dashboard statistics
export interface ServiceDashboardStats {
  total_services: number;
  active_services: number;
  total_providers: number;
  total_orders: number;
  average_rating: number;
  total_revenue: number;
}

// Service assignment data
export interface AssignServiceToPartnerData {
  partner_id: number;
  service_id: number;
  is_active?: boolean;
}

// Update partner service data
export interface UpdatePartnerServiceData {
  id: number;
  is_active?: boolean;
}

// CSV service data interface
export interface CSVServiceData {
  name: string;
  description: string;
  is_active: string;
}
