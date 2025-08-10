import { supabase } from "@/lib/supabase";
import { CreateOrderData, Order, OrderFilters, OrderStats } from "@/types/orders";
import { bitrix24Service } from "./bitrix24Service";

export class OrderService {
  private bitrix24Service: typeof bitrix24Service;

  constructor() {
    this.bitrix24Service = bitrix24Service;
  }

  async syncRecentOrdersFromBitrix24(): Promise<{ created: number; updated: number; skipped: number; errors: number }> {
    try {
      const deals = await this.bitrix24Service.fetchRecentDealsWithFallback();
      
      let created = 0;
      let updated = 0;
      let skipped = 0;
      let errors = 0;

      for (const deal of deals) {
        try {
          const orderData = this.bitrix24Service.transformDealToOrder(deal);
          
          // Skip deals that don't have a valid business order number
          if (!orderData.order_number || /^\d+$/.test(orderData.order_number)) {
            skipped++;
            continue;
          }

          const { data: existingOrder } = await supabase
            .from("orders")
            .select("id")
            .eq("bitrix24_id", orderData.bitrix24_id)
            .single();

          if (existingOrder) {
            // Update existing order
            const { error: updateError } = await supabase
              .from("orders")
              .update(orderData)
              .eq("id", existingOrder.id);

            if (updateError) {
              console.error("Error updating order:", updateError);
              errors++;
            } else {
              updated++;
            }
          } else {
            // Create new order
            const { error: insertError } = await supabase
              .from("orders")
              .insert(orderData);

            if (insertError) {
              console.error("Error creating order:", insertError);
              errors++;
            } else {
              created++;
            }
          }
        } catch (error) {
          console.error("Error processing deal:", error);
          errors++;
        }
      }

      return { created, updated, skipped, errors };
    } catch (error) {
      console.error("Error syncing orders:", error);
      throw error;
    }
  }

  async getOrders(filters: OrderFilters = {}): Promise<{ data: Order[]; total: number }> {
    try {
      // Get all orders first to apply filtering and get accurate count
      let query = supabase
        .from("orders")
        .select("*")
        .order("date_created", { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,service_type.ilike.%${filters.search}%`);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.service_type) {
        query = query.eq("service_type", filters.service_type);
      }
      if (filters.stage_id) {
        query = query.eq("stage_id", filters.stage_id);
      }
      if (filters.assigned_by_id) {
        query = query.eq("assigned_by_id", filters.assigned_by_id);
      }
      if (filters.date_from) {
        query = query.gte("date_created", filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte("date_created", filters.date_to);
      }

      // Filter out orders without valid business order numbers (Supabase part)
      query = query.not("order_number", "is", null)
        .not("order_number", "eq", "");

      const { data, error } = await query;

      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }

      // Post-query filtering to remove numeric-only order numbers
      const filteredData = (data || []).filter(order => {
        if (!order.order_number) return false;
        // Filter out orders that are just numeric IDs (like 634026)
        return !/^\d+$/.test(order.order_number);
      });

      // Apply pagination to filtered data
      let paginatedData = filteredData;
      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        paginatedData = filteredData.slice(from, to);
      }

      return {
        data: paginatedData,
        total: filteredData.length, // Use filtered count for accurate pagination
      };
    } catch (error) {
      console.error("Error in getOrders:", error);
      throw error;
    }
  }

  async getOrderStats(): Promise<OrderStats> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("status, amount, order_number") // Added order_number
        .not("order_number", "is", null)
        .not("order_number", "eq", "");

      if (error) {
        console.error("Supabase stats query error:", error);
        throw error;
      }

      // Post-query filtering to remove numeric-only order numbers
      const validOrders = (data || []).filter(order => {
        if (!order.order_number) return false;
        // Filter out orders that are just numeric IDs (like 634026)
        return !/^\d+$/.test(order.order_number);
      });

      const totalOrders = validOrders.length;
      const completedOrders = validOrders.filter(order => order.status === "completed").length;
      const inProgressOrders = validOrders.filter(order => order.status === "in_progress").length;
      const newOrders = validOrders.filter(order => order.status === "new").length;
      const totalRevenue = validOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const stats = {
        total_orders: totalOrders,
        completed_orders: completedOrders,
        in_progress_orders: inProgressOrders,
        new_orders: newOrders,
        total_revenue: totalRevenue,
        average_order_value: averageOrderValue,
      };

      return stats;
    } catch (error) {
      console.error("Error in getOrderStats:", error);
      throw error;
    }
  }

  async cleanupInvalidOrders(): Promise<{ removed: number; errors: number }> {
    try {
      // First, get all orders to check their order numbers
      const { data: allOrders, error: findError } = await supabase
        .from("orders")
        .select("id, bitrix24_id, order_number");

      if (findError) {
        console.error("Error finding orders:", findError);
        throw findError;
      }

      if (!allOrders || allOrders.length === 0) {
        return { removed: 0, errors: 0 };
      }

      // Filter orders that should be removed
      const invalidOrders = allOrders.filter(order => {
        if (!order.order_number || order.order_number.trim() === '') return true;
        // Check if order number is just numeric (like 634026)
        return /^\d+$/.test(order.order_number);
      });

      if (invalidOrders.length === 0) {
        return { removed: 0, errors: 0 };
      }

      // Delete invalid orders
      const orderIds = invalidOrders.map(order => order.id);
      const { error: deleteError } = await supabase
        .from("orders")
        .delete()
        .in("id", orderIds);

      if (deleteError) {
        console.error("Error deleting invalid orders:", deleteError);
        throw deleteError;
      }

      return { removed: invalidOrders.length, errors: 0 };
    } catch (error) {
      console.error("Error in cleanupInvalidOrders:", error);
      throw error;
    }
  }
}

export const orderService = new OrderService();
