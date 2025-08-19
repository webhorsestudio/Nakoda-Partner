import { NextRequest, NextResponse } from "next/server";
import { partnerService } from "@/services/partnerService";

export async function GET(request: NextRequest) {
  try {
    const stats = await partnerService.getPartnerStats();

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error in partner stats API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch partner statistics",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
