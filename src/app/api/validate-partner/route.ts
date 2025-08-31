import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateAndSanitizeMobile, handleUserValidationError, createUserValidationSuccess, DatabaseError } from "@/utils/validationUtils";

export async function POST(request: NextRequest) {
  try {
    const { mobile } = await request.json();

    // Input validation and sanitization
    const validation = validateAndSanitizeMobile(mobile);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status || 400 }
      );
    }

    // Query the partners table to check if mobile number exists and has partner role
    // Use .maybeSingle() instead of .single() to handle potential duplicates gracefully
    const { data: partnerUsers, error } = await supabase
      .from("partners")
      .select("id, name, email, mobile, status, service_type, verification_status, documents_verified")
      .eq("mobile", validation.sanitizedMobile);

    if (error) {
      const errorResponse = handleUserValidationError(error as unknown as DatabaseError);
      return NextResponse.json(
        { error: errorResponse.error, code: errorResponse.code },
        { status: errorResponse.status }
      );
    }

    if (!partnerUsers || partnerUsers.length === 0) {
      return NextResponse.json(
        { 
          error: "Mobile number not registered. Please check and try again.",
          code: "MOBILE_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    // Handle multiple partners with the same mobile number
    if (partnerUsers.length > 1) {
      console.warn(`Multiple partners found with mobile ${validation.sanitizedMobile}: ${partnerUsers.length} entries`);
      
      // Find the most appropriate partner (prioritize active ones)
      const activePartner = partnerUsers.find(p => p.status === 'Active' || p.status === 'active');
      const pendingPartner = partnerUsers.find(p => p.status === 'Pending' || p.status === 'pending');
      
      // Use active partner if available, otherwise pending, otherwise first one
      const selectedPartner = activePartner || pendingPartner || partnerUsers[0];
      
      // Log the selection for debugging
      console.log(`Selected partner from ${partnerUsers.length} options:`, {
        id: selectedPartner.id,
        status: selectedPartner.status,
        totalFound: partnerUsers.length
      });
    }

    // Get the selected partner (either single or from multiple)
    const partnerUser = partnerUsers.length === 1 ? partnerUsers[0] : 
      (partnerUsers.find(p => p.status === 'Active' || p.status === 'active') || 
       partnerUsers.find(p => p.status === 'Pending' || p.status === 'pending') || 
       partnerUsers[0]);

    if (!partnerUser) {
      return NextResponse.json(
        { 
          error: "Mobile number not registered. Please check and try again.",
          code: "MOBILE_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    // Check if user account is active (not suspended)
    if (partnerUser.status === 'Suspended' || partnerUser.status === 'suspended') {
      return NextResponse.json(
        { 
          error: "Partner account is suspended. Please contact your system administrator.",
          code: "ACCOUNT_SUSPENDED"
        },
        { status: 403 }
      );
    }

    // Return success with partner user info
    return NextResponse.json(createUserValidationSuccess(partnerUser, 'partner'));

  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Unable to verify mobile number. Please try again later." },
      { status: 500 }
      );
  }
}
