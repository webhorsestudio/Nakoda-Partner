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

    // Try exact match first - handle multiple results gracefully
    const { data: partners, error: initialError } = await supabase
      .from("partners")
      .select("*")
      .eq("mobile", mobile);

    let partner = null;
    let hasError = initialError;

    // If we found partners, select the best one
    if (partners && partners.length > 0) {
      if (partners.length === 1) {
        partner = partners[0];
        console.log(`✅ Found single partner: ${partner.name}`);
      } else {
        console.log(`🔍 Found ${partners.length} partners with same mobile, selecting best one...`);
        
        // Prioritize: Active > Pending > Suspended, then most recent
        const activePartner = partners.find(p => p.status === 'Active' || p.status === 'active');
        const pendingPartner = partners.find(p => p.status === 'Pending' || p.status === 'pending');
        
        partner = activePartner || pendingPartner || partners[0];
        console.log(`✅ Selected partner ID ${partner.id} with status: ${partner.status}`);
      }
    }

    // If exact match fails, try with different formats
    if (!partner) {
      console.log(`🔍 Exact match failed, trying different mobile formats...`);
      
      // Try with +91 prefix
      const { data: partnersWithPrefix, error: prefixError } = await supabase
        .from("partners")
        .select("*")
        .eq("mobile", `+91${mobile}`);
      
      if (partnersWithPrefix && partnersWithPrefix.length > 0) {
        if (partnersWithPrefix.length === 1) {
          partner = partnersWithPrefix[0];
        } else {
          // Multiple partners with +91 prefix, select best one
          const activePartner = partnersWithPrefix.find(p => p.status === 'Active' || p.status === 'active');
          const pendingPartner = partnersWithPrefix.find(p => p.status === 'Pending' || p.status === 'pending');
          partner = activePartner || pendingPartner || partnersWithPrefix[0];
        }
        hasError = null;
        console.log(`✅ Found partner with +91 prefix: ${partner.name}`);
      } else {
        // Try without +91 prefix if mobile starts with it
        if (mobile.startsWith('+91')) {
          const mobileWithoutPrefix = mobile.substring(3);
          const { data: partnersWithoutPrefix, error: noPrefixError } = await supabase
            .from("partners")
            .select("*")
            .eq("mobile", mobileWithoutPrefix);
          
          if (partnersWithoutPrefix && partnersWithoutPrefix.length > 0) {
            if (partnersWithoutPrefix.length === 1) {
              partner = partnersWithoutPrefix[0];
            } else {
              // Multiple partners without +91 prefix, select best one
              const activePartner = partnersWithoutPrefix.find(p => p.status === 'Active' || p.status === 'active');
              const pendingPartner = partnersWithoutPrefix.find(p => p.status === 'Pending' || p.status === 'pending');
              partner = activePartner || pendingPartner || partnersWithoutPrefix[0];
            }
            hasError = null;
            console.log(`✅ Found partner without +91 prefix: ${partner.name}`);
          }
        }
      }
    }

    if (hasError && !partner) {
      console.error(`❌ Database error for mobile ${mobile}:`, hasError);
      if (hasError.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: "Partner not found"
          },
          { status: 404 }
        );
      }
      throw hasError;
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