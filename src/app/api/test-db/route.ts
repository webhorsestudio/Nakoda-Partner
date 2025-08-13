import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: "Basic API endpoint working"
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Basic endpoint failed"
    }, { status: 500 });
  }
}
