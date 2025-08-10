import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/orderService";
import { OrderFilters } from "@/types/orders";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: OrderFilters = {
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      service_type: searchParams.get("service_type") || undefined,
      stage_id: searchParams.get("stage_id") || undefined,
      assigned_by_id: searchParams.get("assigned_by_id") || undefined,
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
    };

    const result = await orderService.getOrders(filters);

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total
    });
  } catch (error) {
    console.error("Error in orders API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
