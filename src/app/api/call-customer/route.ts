import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callAcefone } from '@/lib/acefone';

// Request validation schema
const CallCustomerSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  partnerNumber: z.string().min(10, 'Partner number must be at least 10 digits'),
  customerNumber: z.string().min(10, 'Customer number must be at least 10 digits'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = CallCustomerSchema.parse(body);
    
    const { orderId, partnerNumber, customerNumber } = validatedData;
    
    // Call Acefone API
    const acefoneResponse = await callAcefone({
      agent_number: partnerNumber,
      destination_number: customerNumber,
      caller_id: "08065343250",
      async: "1",
      custom_identifier: orderId,
      get_call_id: "1"
    });
    
    return NextResponse.json(acefoneResponse);
    
  } catch (error) {
    console.error('❌ Call customer error:', error);
    
    if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            details: error.issues
          },
          { status: 400 }
        );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

