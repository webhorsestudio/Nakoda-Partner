import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get("mobile");
    const status = searchParams.get("status") || "all";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10;

    if (!mobile) {
      return NextResponse.json(
        {
          success: false,
          error: "Mobile number is required"
        },
        { status: 400 }
      );
    }

    // First, get the partner ID from mobile number
    const { data: partner, error: partnerError } = await supabase
      .from("partners")
      .select("id, name, service_type, status") // Added status here
      .eq("mobile", mobile)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        {
          success: false,
          error: "Partner not found"
        },
        { status: 404 }
      );
    }

    // Check if partner account is active - handle the actual database schema values
    const partnerStatus = partner.status;
    const normalizedStatus = partnerStatus?.toLowerCase();
    
    if (normalizedStatus !== 'active' && normalizedStatus !== 'pending' && normalizedStatus !== 'suspended') {
      return NextResponse.json(
        { success: false, error: "Partner account is deactivated" },
        { status: 403 }
      );
    }

    // Build query to get orders for this partner
    let query = supabase
      .from("orders")
      .select("*")
      .or(`partner.ilike.%${partner.name}%,partner.ilike.%${partner.service_type}%`)
      .order("date_created", { ascending: false })
      .limit(limit);

    // Apply status filter if specified
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      throw ordersError;
    }

    // Transform orders to match the expected format for the frontend
    const transformedOrders = (orders || []).map(order => ({
      id: order.id,
      isExclusive: order.is_new || false,
      countdown: calculateCountdown(order.service_date, order.time_slot),
      scheduledTime: formatScheduledTime(order.service_date, order.time_slot),
      location: order.address || 'Location not specified',
      credits: parseFloat(order.amount?.toString() || '0') / 100, // Convert amount to credits
      likes: 0, // Not implemented yet
      status: mapOrderStatus(order.status),
      priority: determinePriority(order.amount, order.is_new),
      category: order.service_type || 'General Service',
      customerName: order.customer_name || 'Customer',
      estimatedDuration: '2-3 hours', // Default duration
      orderNumber: order.order_number,
      advanceAmount: order.advance_amount,
      taxesAndFees: order.taxes_and_fees,
      commissionPercentage: order.commission_percentage
    }));

    return NextResponse.json({
      success: true,
      data: transformedOrders,
      total: transformedOrders.length,
      partner: {
        id: partner.id,
        name: partner.name,
        serviceType: partner.service_type
      }
    });

  } catch (error) {
    console.error("Error fetching partner orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch partner orders",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate countdown
function calculateCountdown(serviceDate: string, timeSlot: string): string {
  if (!serviceDate) return '00:00';
  
  try {
    const serviceDateTime = new Date(serviceDate);
    const now = new Date();
    const diffMs = serviceDateTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return '00:00';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`;
  } catch (error) {
    return '00:00';
  }
}

// Helper function to format scheduled time
function formatScheduledTime(serviceDate: string, timeSlot: string): string {
  if (!serviceDate) return 'Time not specified';
  
  try {
    const date = new Date(serviceDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  } catch (error) {
    return 'Time not specified';
  }
}

// Helper function to map order status
function mapOrderStatus(status: string): 'pending' | 'accepted' | 'completed' | 'cancelled' {
  switch (status?.toLowerCase()) {
    case 'new':
    case 'pending':
      return 'pending';
    case 'in_progress':
    case 'accepted':
      return 'accepted';
    case 'completed':
    case 'won':
      return 'completed';
    case 'cancelled':
    case 'lost':
      return 'cancelled';
    default:
      return 'pending';
  }
}

// Helper function to determine priority
function determinePriority(amount: number | string, isNew: boolean): 'low' | 'medium' | 'high' {
  if (isNew) return 'high';
  
  const numAmount = parseFloat(amount?.toString() || '0');
  if (numAmount > 5000) return 'high';
  if (numAmount > 2000) return 'medium';
  return 'low';
}
