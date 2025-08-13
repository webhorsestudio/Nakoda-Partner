import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { mobile } = await request.json();

    if (!mobile) {
      return NextResponse.json(
        { error: "Mobile number is required" },
        { status: 400 }
      );
    }

    // Query the admin_users table to check if mobile number exists and has admin role
    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select("id, name, email, phone, role")
      .eq("phone", mobile)
      .eq("role", "Admin")
      .single();

    if (error) {
      console.error("Database error:", error);
      
      // Check if it's a "no rows returned" error (mobile number not found)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: "Mobile number not registered. Please check and try again.",
            code: "MOBILE_NOT_FOUND"
          },
          { status: 404 }
        );
      }
      
      // Check if it's a "not found" error
      if (error.message && error.message.includes('No rows returned')) {
        return NextResponse.json(
          { 
            error: "Mobile number not registered. Please check and try again.",
            code: "MOBILE_NOT_FOUND"
          },
          { status: 404 }
        );
      }
      
      // For other database errors, return a user-friendly message
      return NextResponse.json(
        { error: "Unable to verify mobile number. Please try again later." },
        { status: 500 }
      );
    }

    if (!adminUser) {
      return NextResponse.json(
        { 
          error: "Mobile number not registered. Please check and try again.",
          code: "MOBILE_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    // Return success with admin user info (without sensitive data)
    return NextResponse.json({
      success: true,
      message: "Admin user found",
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Unable to verify mobile number. Please try again later." },
      { status: 500 }
    );
  }
}
