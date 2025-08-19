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

    console.log(`🔍 Looking for partner with mobile: ${mobile}`);

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
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: "Partner not found"
          },
          { status: 404 }
        );
      }
      throw error;
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

    // Check if partner account is active - handle the actual database schema values
    const status = partner.status;
    const normalizedStatus = status?.toLowerCase();
    
    if (normalizedStatus !== 'active' && normalizedStatus !== 'pending' && normalizedStatus !== 'suspended') {
      console.log(`❌ Partner ${partner.name} has inactive status: ${status} (normalized: ${normalizedStatus})`);
      return NextResponse.json(
        {
          success: false,
          error: "Partner account is deactivated"
        },
        { status: 403 }
      );
    }

    console.log(`✅ Partner ${partner.name} is allowed with status: ${status} (normalized: ${normalizedStatus})`);

    return NextResponse.json({
      success: true,
      data: partner
    });

  } catch (error) {
    console.error("Error fetching partner by mobile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch partner information",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}