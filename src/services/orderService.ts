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

          // Use upsert with conflict resolution to prevent duplicate key violations
          const { error: upsertError } = await supabase
            .from("orders")
            .upsert(orderData, {
              onConflict: 'bitrix24_id',
              ignoreDuplicates: false
            });

          if (upsertError) {
            console.error("Error upserting order:", upsertError);
            
            // If it's a duplicate key error, try to update instead
            if (upsertError.code === '23505' && upsertError.message.includes('duplicate key')) {
              console.log(`Attempting to update existing order with bitrix24_id: ${orderData.bitrix24_id}`);
              
              const { error: updateError } = await supabase
                .from("orders")
                .update(orderData)
                .eq("bitrix24_id", orderData.bitrix24_id);

              if (updateError) {
                console.error("Error updating existing order:", updateError);
                errors++;
              } else {
                updated++;
              }
            } else {
              errors++;
            }
          } else {
            // Check if this was an insert or update by looking for existing order
            const { data: existingOrder } = await supabase
              .from("orders")
              .select("id, updated_at")
              .eq("bitrix24_id", orderData.bitrix24_id)
              .single();

            if (existingOrder) {
              // If the order was just updated (updated_at is very recent), count as update
              const updatedAt = new Date(existingOrder.updated_at);
              const now = new Date();
              const timeDiff = now.getTime() - updatedAt.getTime();
              
              if (timeDiff < 5000) { // Less than 5 seconds ago
                updated++;
              } else {
                created++;
              }
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

  async cleanupDuplicateBitrix24Ids(): Promise<{ removed: number; errors: number }> {
    try {
      // First, get all orders to find duplicates
      const { data: allOrders, error: findError } = await supabase
        .from("orders")
        .select("id, bitrix24_id, updated_at");

      if (findError) {
        console.error("Error finding orders:", findError);
        throw findError;
      }

      if (!allOrders || allOrders.length === 0) {
        return { removed: 0, errors: 0 };
      }

      // Group orders by bitrix24_id and find duplicates
      const ordersByBitrixId = new Map<string, Array<{ id: string; updated_at: string }>>();
      
      allOrders.forEach(order => {
        if (!ordersByBitrixId.has(order.bitrix24_id)) {
          ordersByBitrixId.set(order.bitrix24_id, []);
        }
        ordersByBitrixId.get(order.bitrix24_id)!.push({
          id: order.id,
          updated_at: order.updated_at
        });
      });

      // Find bitrix24_ids with duplicates
      const duplicateBitrixIds = Array.from(ordersByBitrixId.entries())
        .filter(([_, orders]) => orders.length > 1)
        .map(([bitrixId, _]) => bitrixId);

      if (duplicateBitrixIds.length === 0) {
        return { removed: 0, errors: 0 };
      }

      let totalRemoved = 0;
      let totalErrors = 0;

      // For each duplicate bitrix24_id, keep only the most recent order
      for (const bitrixId of duplicateBitrixIds) {
        try {
          const ordersWithSameId = ordersByBitrixId.get(bitrixId)!;
          
          // Sort by updated_at (most recent first)
          ordersWithSameId.sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );

          // Keep the first one (most recent) and delete the rest
          const ordersToDelete = ordersWithSameId.slice(1);
          const orderIdsToDelete = ordersToDelete.map(order => order.id);

          const { error: deleteError } = await supabase
            .from("orders")
            .delete()
            .in("id", orderIdsToDelete);

          if (deleteError) {
            console.error(`Error deleting duplicate orders for bitrix24_id ${bitrixId}:`, deleteError);
            totalErrors++;
          } else {
            totalRemoved += ordersToDelete.length;
          }
        } catch (error) {
          console.error(`Error processing duplicate bitrix24_id ${bitrixId}:`, error);
          totalErrors++;
        }
      }

      return { removed: totalRemoved, errors: totalErrors };
    } catch (error) {
      console.error("Error cleaning up duplicate bitrix24_id entries:", error);
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
