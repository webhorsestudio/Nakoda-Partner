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
    const { data: partnerUser, error } = await supabase
      .from("partners")
      .select("id, name, email, mobile, status, service_type, user_role")
      .eq("mobile", validation.sanitizedMobile)
      .single();

    if (error) {
      const errorResponse = handleUserValidationError(error as unknown as DatabaseError);
      return NextResponse.json(
        { error: errorResponse.error, code: errorResponse.code },
        { status: errorResponse.status }
      );
    }

    if (!partnerUser) {
      return NextResponse.json(
        { 
          error: "Mobile number not registered. Please check and try again.",
          code: "MOBILE_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    // Check if user account is active (not soft-deleted)
    if (partnerUser.status !== 'active' && partnerUser.status !== 'pending') {
      return NextResponse.json(
        { 
          error: "Partner account is deactivated. Please contact your system administrator.",
          code: "ACCOUNT_DEACTIVATED"
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
