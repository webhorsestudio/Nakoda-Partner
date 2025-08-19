export interface Partner {
  id: number;
  name: string;
  service_type: string;
  status: 'active' | 'pending' | 'inactive';
  rating: number;
  total_orders: number;
  total_revenue: number;
  location: string;
  city: string;
  state: string;
  pin_code: string;
  mobile: string;
  email: string;
  address: string;
  commission_percentage: number;
  joined_date: string;
  last_active: string | null;
  verification_status: 'Pending' | 'Verified' | 'Rejected';
  documents_verified: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerStats {
  total_partners: number;
  active_partners: number;
  pending_partners: number;
  suspended_partners: number;
  verified_partners: number;
  average_rating: number;
  total_orders: number;
  total_revenue: number;
  average_commission: number;
}

export interface PartnerFilters {
  search?: string;
  status?: string;
  service_type?: string;
  verification_status?: string;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
}

export interface PartnerFormData {
  name: string;
  service_type: string;
  status: 'active' | 'pending' | 'inactive';
  rating: number;
  total_orders: number;
  total_revenue: number;
  location: string;
  city: string;
  state: string;
  pin_code: string;
  mobile: string;
  email: string;
  address: string;
  commission_percentage: number;
  joined_date: string;
  last_active: string | null;
  verification_status: 'Pending' | 'Verified' | 'Rejected';
  documents_verified: boolean;
  notes: string | null;
}

export interface PartnerCreateRequest {
  partner: PartnerFormData;
}

export interface PartnerUpdateRequest {
  id: number;
  partner: Partial<PartnerFormData>;
}

export interface PartnerDeleteRequest {
  id: number;
}

export interface PartnerResponse {
  success: boolean;
  data?: Partner | Partner[];
  total?: number;
  error?: string;
  details?: string;
}

export interface PartnerStatsResponse {
  success: boolean;
  data?: PartnerStats;
  error?: string;
  details?: string;
}

// Service types for dropdowns
export const SERVICE_TYPES = [
  'Electrical',
  'Cleaning',
  'Plumbing',
  'HVAC',
  'Landscaping',
  'Carpentry',
  'Security',
  'IT Services',
  'Painting',
  'Roofing',
  'Flooring',
  'Gardening',
  'Pest Control',
  'Appliance Repair',
  'Moving Services',
  'Other'
] as const;

export const PARTNER_STATUSES = [
  'active',
  'pending',
  'inactive'
] as const;

export const VERIFICATION_STATUSES = [
  'Pending',
  'Verified',
  'Rejected'
] as const;

// States for India
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
  'Puducherry',
  'Andaman and Nicobar Islands'
] as const;
