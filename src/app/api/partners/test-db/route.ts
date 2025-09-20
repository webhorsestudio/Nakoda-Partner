import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_request: NextRequest) {
  try {
    console.log("🧪 Testing database connection...");

    // Test basic connection
    const { error: testError } = await supabase
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

    // Check table structure
    let columns = null;
    let columnsError = null;
    
    try {
      const columnsResult = await supabase
        .rpc('get_table_columns', { table_name: 'partners' });
      columns = columnsResult.data;
      columnsError = columnsResult.error;
    } catch (error) {
      console.log("⚠️ Could not get table columns via RPC, trying alternative method");
      columnsError = error;
    }

    if (columnsError) {
      console.log("⚠️ Could not get table columns via RPC, trying alternative method");
      // Try a simple query to see what columns exist
      const { data: testColumns, error: testColumnsError } = await supabase
        .from("partners")
        .select("*")
        .limit(1);

      if (testColumnsError) {
        console.log("❌ Could not test columns:", testColumnsError);
      } else if (testColumns && testColumns.length > 0) {
        const availableColumns = Object.keys(testColumns[0]);
        console.log("✅ Available columns:", availableColumns);
        console.log("❌ 'deleted_at' column exists:", availableColumns.includes('deleted_at'));
      }
    } else {
      console.log("✅ Table columns:", columns);
    }

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
