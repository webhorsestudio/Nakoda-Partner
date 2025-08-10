import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("Testing orders table structure...");
    
    // Test if table exists and get its structure
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error("Orders table error:", error);
      return NextResponse.json({
        success: false,
        error: "Orders table issue",
        details: error.message
      }, { status: 500 });
    }
    
    console.log("Orders table exists and is accessible");
    console.log("Sample data structure:", data);
    
    // Test inserting a sample order
    const sampleOrder = {
      bitrix24_id: "TEST_ORDER_001",
      title: "Test Order",
      service_type: "Test Service",
      status: "pending",
      currency: "INR",
      amount: 100.00,
      date_created: new Date().toISOString()
    };
    
    console.log("Attempting to insert test order...");
    const { data: insertData, error: insertError } = await supabase
      .from('orders')
      .insert(sampleOrder)
      .select()
      .single();
    
    if (insertError) {
      console.error("Insert test failed:", insertError);
      return NextResponse.json({
        success: false,
        error: "Insert test failed",
        details: insertError.message
      }, { status: 500 });
    }
    
    console.log("Test insert successful:", insertData);
    
    // Clean up test data
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('bitrix24_id', 'TEST_ORDER_001');
    
    if (deleteError) {
      console.error("Test cleanup failed:", deleteError);
    } else {
      console.log("Test cleanup successful");
    }
    
    return NextResponse.json({
      success: true,
      message: "Orders table is working correctly",
      sampleData: data
    });
    
  } catch (error) {
    console.error("Database test error:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Database test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
