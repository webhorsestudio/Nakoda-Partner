import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Webhook payload validation schema
const AcefoneWebhookSchema = z.object({
  $uuid: z.string().optional(),
  $call_status: z.string().optional(),
  $agent_number: z.string().optional(),
  $call_to_number: z.string().optional(),
  // Add other fields as needed
});

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret for security
    const webhookSecret = process.env.ACEFONE_WEBHOOK_SECRET;
    const providedSecret = request.headers.get('x-webhook-secret');
    
    if (webhookSecret && providedSecret !== webhookSecret) {
      console.error('❌ Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse and validate webhook payload
    const body = await request.json();
    const validatedData = AcefoneWebhookSchema.parse(body);
    
    console.log('📞 Acefone webhook received:', validatedData);
    
    // Log to console (as required)
    console.log('📞 Webhook payload:', {
      uuid: validatedData.$uuid,
      callStatus: validatedData.$call_status,
      agentNumber: validatedData.$agent_number,
      callToNumber: validatedData.$call_to_number,
      timestamp: new Date().toISOString()
    });
    
    // Simulate storing in DB (calls table)
    // In a real implementation, you would store this in your database
    console.log('📞 Simulating DB storage for call:', {
      call_id: validatedData.$uuid,
      status: validatedData.$call_status,
      partner_phone: validatedData.$agent_number,
      customer_phone: validatedData.$call_to_number,
      created_at: new Date().toISOString()
    });
    
    // Respond with 200 OK
    return NextResponse.json({ success: true, message: 'Webhook received' });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    if (error instanceof z.ZodError) {
      console.error('❌ Webhook validation error:', error.issues);
    }
    
    // Still return 200 OK to prevent webhook retries
    return NextResponse.json({ success: false, error: 'Processing failed' });
  }
}

