import { NextRequest, NextResponse } from "next/server";
import { partnerService } from "@/services/partnerService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const partnerId = parseInt(id);
    
    if (isNaN(partnerId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid partner ID"
        },
        { status: 400 }
      );
    }

    const partner = await partnerService.getPartnerById(partnerId);

    return NextResponse.json({
      success: true,
      data: partner
    });
  } catch (error) {
    console.error("Error fetching partner:", error);
    
    if (error instanceof Error && error.message === "Partner not found") {
      return NextResponse.json(
        {
          success: false,
          error: "Partner not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch partner",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const partnerId = parseInt(id);
    
    if (isNaN(partnerId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid partner ID"
        },
        { status: 400 }
      );
    }

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

    const updatedPartner = await partnerService.updatePartner(partnerId, partner);

    return NextResponse.json({
      success: true,
      data: updatedPartner,
      message: "Partner updated successfully"
    });
  } catch (error) {
    console.error("Error updating partner:", error);
    
    if (error instanceof Error && error.message === "Partner not found") {
      return NextResponse.json(
        {
          success: false,
          error: "Partner not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update partner",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const partnerId = parseInt(id);
    
    if (isNaN(partnerId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid partner ID"
        },
        { status: 400 }
      );
    }

    await partnerService.deletePartner(partnerId);

    return NextResponse.json({
      success: true,
      message: "Partner deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting partner:", error);
    
    if (error instanceof Error && error.message === "Partner not found") {
      return NextResponse.json(
        {
          success: false,
          error: "Partner not found"
        },
        { status: 404 }
      );
    }

    // Check for foreign key constraint errors
    if (error instanceof Error && error.message.includes("violates foreign key constraint")) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete partner - they have associated orders or other related data"
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete partner",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
