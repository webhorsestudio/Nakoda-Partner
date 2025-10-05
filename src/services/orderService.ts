import { supabase } from "@/lib/supabase";
import { professionalBitrix24Service } from "./professionalBitrix24Service";

export class OrderService {
  constructor() {
    // Use professional Bitrix24 service
  }

  async syncRecentOrdersFromBitrix24(): Promise<{ created: number; updated: number; skipped: number; errors: number }> {
    try {
      const deals = await professionalBitrix24Service.fetchRecentDealsWithFallback();
      
      let created = 0;
      let updated = 0;
      let skipped = 0;
      let errors = 0;

      for (const deal of deals) {
        try {
          const orderData = professionalBitrix24Service.transformDealToOrder(deal);
          
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
            // Check if order already exists
            const { data: existingOrder, error: checkError } = await supabase
              .from('orders')
              .select('id')
              .eq('bitrix24_id', orderData.bitrix24_id)
              .single();

            if (checkError && checkError.code !== 'PGRST116') {
              throw checkError;
            }

            if (existingOrder) {
              // Update existing order
              const { error: updateError } = await supabase
                .from('orders')
                .update(orderData)
                .eq('id', existingOrder.id)
                .select()
                .single();

              if (updateError) {
                console.error("Error updating existing order:", updateError);
                errors++;
              } else {
                updated++;
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
        .filter(([, orders]) => orders.length > 1)
        .map(([bitrixId]) => bitrixId);

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
