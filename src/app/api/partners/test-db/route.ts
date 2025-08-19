import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing database connection...");

    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from("partners")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("❌ Database connection test failed:", testError);
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: testError.message
        },
        { status: 500 }
      );
    }

    console.log("✅ Database connection successful");

    // Get total count of partners
    const { count, error: countError } = await supabase
      .from("partners")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Count query failed:", countError);
      return NextResponse.json(
        {
          success: false,
          error: "Count query failed",
          details: countError.message
        },
        { status: 500 }
      );
    }

    // Get sample partners to check data structure
    const { data: samplePartners, error: sampleError } = await supabase
      .from("partners")
      .select("id, name, mobile, status, service_type")
      .limit(5);

    if (sampleError) {
      console.error("❌ Sample data query failed:", sampleError);
      return NextResponse.json(
        {
          success: false,
          error: "Sample data query failed",
          details: sampleError.message
        },
        { status: 500 }
      );
    }

    console.log("✅ Sample partners retrieved:", samplePartners);

    return NextResponse.json({
      success: true,
      message: "Database connection and queries successful",
      data: {
        totalPartners: count,
        samplePartners: samplePartners
      }
    });

  } catch (error) {
    console.error("❌ Test endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Test endpoint failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
