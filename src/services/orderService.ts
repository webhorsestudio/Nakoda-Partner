import { supabase } from "@/lib/supabase";
import { Order, CreateOrderData, UpdateOrderData, OrderStats, OrderFilters } from "@/types/orders";

class OrderService {
  /**
   * Get all orders with optional filters and pagination
   */
  async getOrders(filters: OrderFilters = {}): Promise<{ data: Order[]; total: number }> {
    try {
      // First, get total count for pagination
      let countQuery = supabase
        .from("orders")
        .select("*", { count: 'exact', head: true });

      // Apply filters to count query
      if (filters.search) {
        countQuery = countQuery.or(`title.ilike.%${filters.search}%,service_type.ilike.%${filters.search}%`);
      }

      if (filters.status) {
        countQuery = countQuery.eq("status", filters.status);
      }

      if (filters.service_type) {
        countQuery = countQuery.eq("service_type", filters.service_type);
      }

      if (filters.stage_id) {
        countQuery = countQuery.eq("stage_id", filters.stage_id);
      }

      if (filters.assigned_by_id) {
        countQuery = countQuery.eq("assigned_by_id", filters.assigned_by_id);
      }

      if (filters.date_from) {
        countQuery = countQuery.gte("date_created", filters.date_from);
      }

      if (filters.date_to) {
        countQuery = countQuery.lte("date_created", filters.date_to);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error counting orders:", countError);
        throw countError;
      }

      // Now get the actual data with pagination
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

      // Apply pagination
      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }

      return {
        data: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error("Error in getOrders:", error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching order:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in getOrderById:", error);
      throw error;
    }
  }

  /**
   * Get order by Bitrix24 ID
   */
  async getOrderByBitrix24Id(bitrix24Id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("bitrix24_id", bitrix24Id)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results

      if (error) {
        console.error("Error fetching order by Bitrix24 ID:", error);
        throw error;
      }

      return data; // This will be null if no order is found
    } catch (error) {
      console.error("Error in getOrderByBitrix24Id:", error);
      throw error;
    }
  }

  /**
   * Create new order
   */
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      console.log(`Attempting to create order with data:`, orderData);
      
      const { data, error } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (error) {
        console.error("Error creating order:", error);
        console.error("Error details:", error.message, error.details, error.hint);
        throw error;
      }

      console.log(`Successfully created order:`, data);
      return data;
    } catch (error) {
      console.error("Error in createOrder:", error);
      throw error;
    }
  }

  /**
   * Update order
   */
  async updateOrder(id: string, orderData: UpdateOrderData): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update(orderData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating order:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in updateOrder:", error);
      throw error;
    }
  }

  /**
   * Update order by Bitrix24 ID
   */
  async updateOrderByBitrix24Id(bitrix24Id: string, orderData: UpdateOrderData): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update(orderData)
        .eq("bitrix24_id", bitrix24Id)
        .select()
        .single();

      if (error) {
        console.error("Error updating order by Bitrix24 ID:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in updateOrderByBitrix24Id:", error);
      throw error;
    }
  }

  /**
   * Delete order
   */
  async deleteOrder(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting order:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in deleteOrder:", error);
      throw error;
    }
  }

  /**
   * Upsert order (create or update)
   */
  async upsertOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      // Check if order exists
      const existingOrder = await this.getOrderByBitrix24Id(orderData.bitrix24_id);

      if (existingOrder) {
        // Update existing order
        return await this.updateOrderByBitrix24Id(orderData.bitrix24_id, orderData);
      } else {
        // Create new order
        return await this.createOrder(orderData);
      }
    } catch (error) {
      console.error("Error in upsertOrder:", error);
      throw error;
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(): Promise<OrderStats> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("status, amount");

      if (error) {
        console.error("Error fetching order stats:", error);
        throw error;
      }

      const orders = data || [];
      const totalOrders = orders.length;
      const completedOrders = orders.filter(order => order.status === "completed").length;
      const inProgressOrders = orders.filter(order => order.status === "in_progress").length;
      const newOrders = orders.filter(order => order.status === "new").length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        total_orders: totalOrders,
        completed_orders: completedOrders,
        in_progress_orders: inProgressOrders,
        new_orders: newOrders,
        total_revenue: totalRevenue,
        average_order_value: averageOrderValue,
      };
    } catch (error) {
      console.error("Error in getOrderStats:", error);
      throw error;
    }
  }

  /**
   * Sync recent orders from Bitrix24 (last 30 days) with fallback
   */
  async syncRecentOrdersFromBitrix24(): Promise<{ created: number; updated: number; errors: number }> {
    try {
      const { bitrix24Service } = await import("./bitrix24Service");
      
      // Test connection first
      const isConnected = await bitrix24Service.testConnection();
      if (!isConnected) {
        throw new Error("Failed to connect to Bitrix24 API");
      }
      
      console.log("Starting to fetch deals from Bitrix24...");
      
      // Use the fallback method that handles API errors gracefully
      const deals = await bitrix24Service.fetchRecentDealsWithFallback();
      
      console.log(`Fetched ${deals.length} deals from Bitrix24. Starting database sync...`);
      
      // Log the first few deals to see their structure
      if (deals.length > 0) {
        console.log("Sample deals structure:");
        deals.slice(0, 3).forEach((deal, index) => {
          console.log(`Deal ${index + 1}:`, {
            ID: deal.ID,
            TITLE: deal.TITLE,
            STAGE_ID: deal.STAGE_ID,
            DATE_CREATE: deal.DATE_CREATE
          });
        });
      }

      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const deal of deals) {
        try {
          console.log(`Processing deal ${deal.ID}: ${deal.TITLE}`);
          
          const orderData = bitrix24Service.transformDealToOrder(deal);
          console.log(`Transformed deal to order data:`, {
            bitrix24_id: orderData.bitrix24_id,
            title: orderData.title,
            status: orderData.status,
            stage_id: orderData.stage_id
          });
          
          const existingOrder = await this.getOrderByBitrix24Id(orderData.bitrix24_id);
          console.log(`Existing order check for ${orderData.bitrix24_id}:`, existingOrder ? "Found" : "Not found");

          if (existingOrder) {
            console.log(`Updating existing order ${orderData.bitrix24_id}`);
            await this.updateOrderByBitrix24Id(orderData.bitrix24_id, orderData);
            updated++;
            console.log(`Updated order ${orderData.bitrix24_id}`);
          } else {
            console.log(`Creating new order ${orderData.bitrix24_id}`);
            await this.createOrder(orderData);
            created++;
            console.log(`Created order ${orderData.bitrix24_id}`);
          }
        } catch (error) {
          console.error(`Error processing deal ${deal.ID}:`, error);
          errors++;
        }
      }

      console.log(`Sync completed: ${created} created, ${updated} updated, ${errors} errors`);
      return { created, updated, errors };
    } catch (error) {
      console.error("Error in syncRecentOrdersFromBitrix24:", error);
      throw error;
    }
  }

  /**
   * Sync orders from Bitrix24 (all orders - legacy method)
   */
  async syncOrdersFromBitrix24(): Promise<{ created: number; updated: number; errors: number }> {
    try {
      const { bitrix24Service } = await import("./bitrix24Service");
      const deals = await bitrix24Service.fetchRecentDealsWithFallback();

      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const deal of deals) {
        try {
          const orderData = bitrix24Service.transformDealToOrder(deal);
          const existingOrder = await this.getOrderByBitrix24Id(orderData.bitrix24_id);

          if (existingOrder) {
            await this.updateOrderByBitrix24Id(orderData.bitrix24_id, orderData);
            updated++;
          } else {
            await this.createOrder(orderData);
            created++;
          }
        } catch (error) {
          console.error(`Error processing deal ${deal.ID}:`, error);
          errors++;
        }
      }

      return { created, updated, errors };
    } catch (error) {
      console.error("Error in syncOrdersFromBitrix24:", error);
      throw error;
    }
  }
}

export const orderService = new OrderService();
