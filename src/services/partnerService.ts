import { supabase } from "@/lib/supabase";
import { Partner, PartnerStats, PartnerFilters, PartnerFormData } from "@/types/partners";

export class PartnerService {
  /**
   * Get all partners with optional filtering and pagination
   */
  async getPartners(filters: PartnerFilters = {}): Promise<{ data: Partner[]; total: number }> {
    try {
      let query = supabase
        .from("partners")
        .select("*", { count: "exact" });
        // Removed .is("deleted_at", null) since that column doesn't exist

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,service_type.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.service_type && filters.service_type !== "all") {
        query = query.eq("service_type", filters.service_type);
      }

      if (filters.verification_status && filters.verification_status !== "all") {
        query = query.eq("verification_status", filters.verification_status);
      }

      if (filters.city && filters.city !== "all") {
        query = query.eq("city", filters.city);
      }

      if (filters.state && filters.state !== "all") {
        query = query.eq("state", filters.state);
      }

      // Apply pagination
      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      // Order by most recent first
      query = query.order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching partners:", error);
        throw new Error(`Failed to fetch partners: ${error.message}`);
      }

      return {
        data: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error("Error in getPartners:", error);
      throw error;
    }
  }

  /**
   * Get a single partner by ID
   */
  async getPartnerById(id: number): Promise<Partner> {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("id", id)
        .single();
        // Removed .is("deleted_at", null) since that column doesn't exist

      if (error) {
        console.error("Error fetching partner:", error);
        throw new Error(`Failed to fetch partner: ${error.message}`);
      }

      if (!data) {
        throw new Error("Partner not found");
      }

      return data;
    } catch (error) {
      console.error("Error in getPartnerById:", error);
      throw error;
    }
  }

  /**
   * Create a new partner
   */
  async createPartner(partnerData: PartnerFormData): Promise<Partner> {
    try {
      const { data, error } = await supabase
        .from("partners")
        .insert([partnerData])
        .select()
        .single();

      if (error) {
        console.error("Error creating partner:", error);
        throw new Error(`Failed to create partner: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in createPartner:", error);
      throw error;
    }
  }

  /**
   * Update an existing partner
   */
  async updatePartner(id: number, partnerData: Partial<PartnerFormData>): Promise<Partner> {
    try {
      const { data, error } = await supabase
        .from("partners")
        .update(partnerData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating partner:", error);
        throw new Error(`Failed to update partner: ${error.message}`);
      }

      if (!data) {
        throw new Error("Partner not found");
      }

      return data;
    } catch (error) {
      console.error("Error in updatePartner:", error);
      throw error;
    }
  }

  /**
   * Soft delete a partner (mark as deleted instead of actually deleting)
   */
  async deletePartner(id: number): Promise<void> {
    try {
      // First check if partner exists
      const { data: existingPartner, error: checkError } = await supabase
        .from("partners")
        .select("id")
        .eq("id", id)
        .single();

      if (checkError) {
        console.error("Error checking partner existence:", checkError);
        throw new Error("Partner not found");
      }

      if (!existingPartner) {
        throw new Error("Partner not found");
      }

      // Soft delete: mark as deleted and change status to inactive
      const { error } = await supabase
        .from("partners")
        .update({ 
          deleted_at: new Date().toISOString(),
          status: 'inactive'
        })
        .eq("id", id);

      if (error) {
        console.error("Error soft deleting partner:", error);
        throw new Error(`Failed to delete partner: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in deletePartner:", error);
      throw error;
    }
  }

  /**
   * Get partner statistics
   */
  async getPartnerStats(): Promise<PartnerStats> {
    try {
      const { data, error } = await supabase
        .from("partner_stats")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching partner stats:", error);
        // Fallback: calculate stats manually if view doesn't exist
        return this.calculateStatsManually();
      }

      return data;
    } catch (error) {
      console.error("Error in getPartnerStats:", error);
      // Fallback: calculate stats manually
      return this.calculateStatsManually();
    }
  }

  /**
   * Fallback method to calculate stats manually
   */
  private async calculateStatsManually(): Promise<PartnerStats> {
    try {
      const { data: partners, error } = await supabase
        .from("partners")
        .select("*");

      if (error) {
        throw error;
      }

      const totalPartners = partners?.length || 0;
      const activePartners = partners?.filter(p => p.status === 'Active').length || 0;
      const pendingPartners = partners?.filter(p => p.status === 'Pending').length || 0;
      const suspendedPartners = partners?.filter(p => p.status === 'Suspended').length || 0;
      const verifiedPartners = partners?.filter(p => p.verification_status === 'Verified').length || 0;
      
      const averageRating = partners && partners.length > 0 
        ? Number((partners.reduce((sum, p) => sum + (p.rating || 0), 0) / partners.length).toFixed(2))
        : 0;
      
      const totalOrders = partners?.reduce((sum, p) => sum + (p.total_orders || 0), 0) || 0;
      const totalRevenue = partners?.reduce((sum, p) => sum + (p.total_revenue || 0), 0) || 0;
      const averageCommission = partners && partners.length > 0
        ? Number((partners.reduce((sum, p) => sum + (p.commission_percentage || 0), 0) / partners.length).toFixed(2))
        : 0;

      return {
        total_partners: totalPartners,
        active_partners: activePartners,
        pending_partners: pendingPartners,
        suspended_partners: suspendedPartners,
        verified_partners: verifiedPartners,
        average_rating: averageRating,
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        average_commission: averageCommission
      };
    } catch (error) {
      console.error("Error calculating stats manually:", error);
      // Return default stats
      return {
        total_partners: 0,
        active_partners: 0,
        pending_partners: 0,
        suspended_partners: 0,
        verified_partners: 0,
        average_rating: 0,
        total_orders: 0,
        total_revenue: 0,
        average_commission: 0
      };
    }
  }

  /**
   * Update partner status
   */
  async updatePartnerStatus(id: number, status: string): Promise<Partner> {
    try {
      const { data, error } = await supabase
        .from("partners")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating partner status:", error);
        throw new Error(`Failed to update partner status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in updatePartnerStatus:", error);
      throw error;
    }
  }

  /**
   * Update partner verification status
   */
  async updateVerificationStatus(id: number, verificationStatus: string, documentsVerified: boolean): Promise<Partner> {
    try {
      const { data, error } = await supabase
        .from("partners")
        .update({ 
          verification_status: verificationStatus,
          documents_verified: documentsVerified
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating verification status:", error);
        throw new Error(`Failed to update verification status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in updateVerificationStatus:", error);
      throw error;
    }
  }

  /**
   * Permanently delete a partner from the database
   */
  async permanentlyDeletePartner(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from("partners")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error permanently deleting partner:", error);
        throw new Error(`Failed to permanently delete partner: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in permanentlyDeletePartner:", error);
      throw error;
    }
  }

  /**
   * Permanently delete multiple partners from the database
   */
  async permanentlyDeleteMultiplePartners(ids: number[]): Promise<void> {
    try {
      const { error } = await supabase
        .from("partners")
        .delete()
        .in("id", ids);

      if (error) {
        console.error("Error permanently deleting multiple partners:", error);
        throw new Error(`Failed to permanently delete partners: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in permanentlyDeleteMultiplePartners:", error);
      throw error;
    }
  }

  /**
   * Get partners by service type
   */
  async getPartnersByServiceType(serviceType: string): Promise<Partner[]> {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("service_type", serviceType)
        .eq("status", "Active")
        .order("rating", { ascending: false });

      if (error) {
        console.error("Error fetching partners by service type:", error);
        throw new Error(`Failed to fetch partners: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error in getPartnersByServiceType:", error);
      throw error;
    }
  }

  /**
   * Search partners by name or service
   */
  async searchPartners(searchTerm: string): Promise<Partner[]> {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .or(`name.ilike.%${searchTerm}%,service_type.ilike.%${searchTerm}%`)
        .eq("status", "Active")
        .order("rating", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error searching partners:", error);
        throw new Error(`Failed to search partners: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error in searchPartners:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const partnerService = new PartnerService();
