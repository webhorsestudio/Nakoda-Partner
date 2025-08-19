import { NextRequest, NextResponse } from "next/server";
import { partnerService } from "@/services/partnerService";
import { PartnerFilters } from "@/types/partners";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: PartnerFilters = {
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      service_type: searchParams.get("service_type") || undefined,
      verification_status: searchParams.get("verification_status") || undefined,
      city: searchParams.get("city") || undefined,
      state: searchParams.get("state") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
    };

    const result = await partnerService.getPartners(filters);

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total
    });
  } catch (error) {
    console.error("Error in partners API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch partners",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partner } = body;

    if (!partner) {
      return NextResponse.json(
        {
          success: false,
          error: "Partner data is required"
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!partner.name || !partner.service_type) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and service type are required"
        },
        { status: 400 }
      );
    }

    const createdPartner = await partnerService.createPartner(partner);

    return NextResponse.json({
      success: true,
      data: createdPartner,
      message: "Partner created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating partner:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create partner",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
