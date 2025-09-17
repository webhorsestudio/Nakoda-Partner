export interface PromotionalImage {
  id: number;
  title: string;
  subtitle?: string;
  button_text: string;
  brand_name: string;
  image_url: string;
  image_alt?: string;
  gradient_from: string;
  gradient_to: string;
  is_active: boolean;
  display_order: number;
  auto_rotate_duration: number;
  action_type: 'button' | 'link' | 'none';
  action_url?: string;
  action_target: '_self' | '_blank';
  target_audience: 'all' | 'new' | 'active' | 'inactive';
  click_count: number;
  view_count: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface PromotionalImageAnalytics {
  id: number;
  image_id: number;
  event_type: 'view' | 'click' | 'impression';
  partner_id?: number;
  session_id?: string;
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
  created_at: string;
}

export interface CreatePromotionalImageRequest {
  title: string;
  subtitle?: string;
  button_text?: string;
  brand_name?: string;
  image_url: string;
  image_alt?: string;
  gradient_from?: string;
  gradient_to?: string;
  display_order?: number;
  auto_rotate_duration?: number;
  action_type?: 'button' | 'link' | 'none';
  action_url?: string;
  action_target?: '_self' | '_blank';
  target_audience?: 'all' | 'new' | 'active' | 'inactive';
  expires_at?: string;
}

export interface UpdatePromotionalImageRequest extends Partial<CreatePromotionalImageRequest> {
  id: number;
  is_active?: boolean;
}

export interface PromotionalImageFilters {
  search?: string;
  is_active?: boolean;
  target_audience?: string;
  action_type?: string;
  page?: number;
  limit?: number;
}

export interface PromotionalImageStats {
  total_images: number;
  active_images: number;
  inactive_images: number;
  total_views: number;
  total_clicks: number;
  click_through_rate: number;
  top_performing_image: {
    id: number;
    title: string;
    views: number;
    clicks: number;
  } | null;
}

export interface PromotionalImagePagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
