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

    // Query the admin_users table to check if mobile number exists and has admin role
    const { data: adminUsers, error } = await supabase
      .from("admin_users")
      .select("id, name, email, phone, role, status")
      .eq("phone", validation.sanitizedMobile)
      .eq("role", "Admin");

    if (error) {
      const errorResponse = handleUserValidationError(error as unknown as DatabaseError);
      return NextResponse.json(
        { error: errorResponse.error, code: errorResponse.code },
        { status: errorResponse.status }
      );
    }

    // Check if admin user exists
    if (!adminUsers || adminUsers.length === 0) {
      return NextResponse.json(
        { 
          error: "Mobile number not registered. Please check and try again.",
          code: "MOBILE_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    // If multiple admin users exist, select the first one (should be rare)
    const adminUser = adminUsers[0];
    
    if (adminUsers.length > 1) {
      console.log(`⚠️ Found ${adminUsers.length} admin users with same phone number, using first one: ${adminUser.name}`);
    }

    // Check if user account is active
    if (adminUser.status !== 'Active') {
      return NextResponse.json(
        { 
          error: "Account is deactivated. Please contact your system administrator.",
          code: "ACCOUNT_DEACTIVATED"
        },
        { status: 403 }
      );
    }

    // Return success with admin user info
    return NextResponse.json(createUserValidationSuccess(adminUser, 'admin'));

  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Unable to verify mobile number. Please try again later." },
      { status: 500 }
    );
  }
}
