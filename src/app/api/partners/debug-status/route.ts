import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get("mobile");

    if (!mobile) {
      return NextResponse.json(
        {
          success: false,
          error: "Mobile number is required"
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Debug: Looking for partner with mobile: ${mobile}`);

    // Try exact match first
    let { data: partner, error } = await supabase
      .from("partners")
      .select("*")
      .eq("mobile", mobile)
      .single();

    // If exact match fails, try with different formats
    if (error && error.code === 'PGRST116') {
      console.log(`🔍 Exact match failed, trying different mobile formats...`);
      
      // Try with +91 prefix
      const { data: partnerWithPrefix, error: prefixError } = await supabase
        .from("partners")
        .select("*")
        .eq("mobile", `+91${mobile}`)
        .single();
      
      if (!prefixError && partnerWithPrefix) {
        partner = partnerWithPrefix;
        error = null;
        console.log(`✅ Found partner with +91 prefix: ${partner.name}`);
      } else {
        // Try without +91 prefix if mobile starts with it
        if (mobile.startsWith('+91')) {
          const mobileWithoutPrefix = mobile.substring(3);
          const { data: partnerWithoutPrefix, error: noPrefixError } = await supabase
            .from("partners")
            .select("*")
            .eq("mobile", mobileWithoutPrefix)
            .single();
          
          if (!noPrefixError && partnerWithoutPrefix) {
            partner = partnerWithoutPrefix;
            error = null;
            console.log(`✅ Found partner without +91 prefix: ${partner.name}`);
          }
        }
      }
    }

    if (error) {
      console.error(`❌ Database error for mobile ${mobile}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: "Partner not found",
          details: error.message
        },
        { status: 404 }
      );
    }

    if (!partner) {
      console.log(`❌ No partner found for mobile: ${mobile}`);
      return NextResponse.json(
        {
          success: false,
          error: "Partner not found"
        },
        { status: 404 }
      );
    }

    console.log(`✅ Partner found: ${partner.name}, Status: ${partner.status}`);

    // Return detailed partner info for debugging
    return NextResponse.json({
      success: true,
      message: "Partner found - debugging status",
      data: {
        id: partner.id,
        name: partner.name,
        mobile: partner.mobile,
        status: partner.status,
        statusType: typeof partner.status,
        service_type: partner.service_type,
        verification_status: partner.verification_status,
        total_orders: partner.total_orders,
        total_revenue: partner.total_revenue,
        created_at: partner.created_at,
        last_active: partner.last_active
      },
      statusCheck: {
        isActive: partner.status === 'Active',
        isPending: partner.status === 'Pending',
        isSuspended: partner.status === 'Suspended',
        isValidStatus: ['Active', 'Pending'].includes(partner.status),
        statusComparison: {
          'Active': partner.status === 'Active',
          'Pending': partner.status === 'Pending',
          'Suspended': partner.status === 'Suspended'
        }
      }
    });

  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Debug endpoint failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
