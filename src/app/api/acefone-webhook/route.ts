import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { CALL_STATUS, CALL_TYPES } from '@/config/acefone';

// Webhook payload validation schema based on Acefone documentation
const AcefoneWebhookSchema = z.object({
  uuid: z.string().optional(),
  call_id: z.string().optional(),
  call_status: z.string().optional(),
  agent_number: z.string().optional(),
  call_to_number: z.string().optional(),
  caller_id_number: z.string().optional(),
  start_stamp: z.string().optional(),
  end_stamp: z.string().optional(),
  duration: z.string().optional(),
  // Additional fields that might be sent
  hangup_cause: z.string().optional(),
  recording_url: z.string().optional(),
  call_quality: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('📞 Acefone webhook received');
    
    // Verify webhook secret for security
    const webhookSecret = process.env.ACEFONE_WEBHOOK_SECRET;
    const providedSecret = request.headers.get('x-webhook-secret');
    
    if (webhookSecret && providedSecret !== webhookSecret) {
      console.error('❌ Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse and validate webhook payload
    const body = await request.json();
    console.log('📞 Webhook payload:', body);
    
    const validatedData = AcefoneWebhookSchema.parse(body);
    const {
      uuid,
      call_id,
      call_status,
      agent_number,
      call_to_number,
      caller_id_number,
      start_stamp,
      end_stamp,
      duration,
      hangup_cause,
      recording_url,
      call_quality
    } = validatedData;
    
    console.log('📞 Parsed webhook data:', validatedData);
    
    // Update call log with new status
    if (call_id) {
      await updateCallLog({
        call_id,
        uuid,
        status: mapCallStatus(call_status),
        agent_number,
        call_to_number,
        caller_id_number,
        start_stamp,
        end_stamp,
        duration: duration ? parseInt(duration) : null,
        hangup_cause,
        recording_url,
        call_quality: mapCallQuality(call_quality)
      });
    }
    
    // Log to console for debugging
    console.log('📞 Call status update:', {
      callId: call_id,
      uuid: uuid,
      status: call_status,
      agentNumber: agent_number,
      callToNumber: call_to_number,
      callerIdNumber: caller_id_number,
      startTime: start_stamp,
      endTime: end_stamp,
      duration: duration,
      hangupCause: hangup_cause,
      recordingUrl: recording_url,
      callQuality: call_quality,
      timestamp: new Date().toISOString()
    });
    
    // Respond with 200 OK
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      call_id: call_id,
      status: call_status
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    if (error instanceof z.ZodError) {
      console.error('❌ Webhook validation error:', error.issues);
    }
    
    // Still return 200 OK to prevent webhook retries
    return NextResponse.json({ 
      success: false, 
      error: 'Processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// GET endpoint for testing webhook
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testWebhook = searchParams.get('test');
    
    if (testWebhook === 'true') {
      // Simulate a test webhook
      const testData = {
        uuid: 'test-uuid-123',
        call_id: 'test-call-456',
        call_status: 'completed',
        agent_number: '9876543210',
        call_to_number: '08065343250',
        caller_id_number: '9123456789',
        start_stamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        end_stamp: new Date().toISOString(),
        duration: '300',
        hangup_cause: 'NORMAL_CLEARING',
        call_quality: 'good'
      };
      
      console.log('🧪 Test webhook simulation:', testData);
      
      await updateCallLog({
        call_id: testData.call_id,
        uuid: testData.uuid,
        status: mapCallStatus(testData.call_status),
        agent_number: testData.agent_number,
        call_to_number: testData.call_to_number,
        caller_id_number: testData.caller_id_number,
        start_stamp: testData.start_stamp,
        end_stamp: testData.end_stamp,
        duration: parseInt(testData.duration),
        hangup_cause: testData.hangup_cause,
        call_quality: mapCallQuality(testData.call_quality)
      });
      
      return NextResponse.json({
        success: true,
        message: 'Test webhook processed',
        testData,
        note: 'Check your database for the updated call log'
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Acefone webhook endpoint is ready',
      instructions: [
        '1. Configure this endpoint in your Acefone dashboard',
        '2. Set the webhook URL to: ' + process.env.NEXT_PUBLIC_APP_URL + '/api/acefone-webhook',
        '3. Set webhook secret (optional): ' + (process.env.ACEFONE_WEBHOOK_SECRET ? 'Configured' : 'Not configured'),
        '4. Test webhook: ' + process.env.NEXT_PUBLIC_APP_URL + '/api/acefone-webhook?test=true'
      ]
    });
    
  } catch (error) {
    console.error('❌ GET endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Map Acefone call status to our internal status
 */
function mapCallStatus(acefoneStatus?: string): string {
  if (!acefoneStatus) return CALL_STATUS.INITIATED;
  
  const statusMap: Record<string, string> = {
    'initiated': CALL_STATUS.INITIATED,
    'ringing': CALL_STATUS.RINGING,
    'answered': CALL_STATUS.CONNECTED,
    'connected': CALL_STATUS.CONNECTED,
    'completed': CALL_STATUS.COMPLETED,
    'failed': CALL_STATUS.FAILED,
    'busy': CALL_STATUS.BUSY,
    'no-answer': CALL_STATUS.NO_ANSWER,
    'no_answer': CALL_STATUS.NO_ANSWER,
    'cancelled': CALL_STATUS.CANCELLED,
    'timeout': CALL_STATUS.FAILED
  };
  
  return statusMap[acefoneStatus.toLowerCase()] || CALL_STATUS.INITIATED;
}

/**
 * Map Acefone call quality to our internal quality
 */
function mapCallQuality(acefoneQuality?: string): string {
  if (!acefoneQuality) return 'unknown';
  
  const qualityMap: Record<string, string> = {
    'excellent': 'excellent',
    'good': 'good',
    'fair': 'fair',
    'poor': 'poor',
    'bad': 'poor'
  };
  
  return qualityMap[acefoneQuality.toLowerCase()] || 'unknown';
}

/**
 * Update call log in database
 */
async function updateCallLog(callData: {
  call_id: string;
  uuid?: string;
  status: string;
  agent_number?: string;
  call_to_number?: string;
  caller_id_number?: string;
  start_stamp?: string;
  end_stamp?: string;
  duration?: number | null;
  hangup_cause?: string;
  recording_url?: string;
  call_quality: string;
}) {
  try {
    // First, try to find existing call log
    const { data: existingCall, error: findError } = await supabaseAdmin
      .from('call_logs')
      .select('id, partner_id, order_id')
      .eq('call_id', callData.call_id)
      .single();
    
    if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error finding existing call log:', findError);
      return;
    }
    
    // Prepare update data
    const updateData: Record<string, unknown> = {
      status: callData.status,
      updated_at: new Date().toISOString()
    };
    
    // Add optional fields if provided
    if (callData.uuid) updateData.uuid = callData.uuid;
    if (callData.start_stamp) updateData.start_time = callData.start_stamp;
    if (callData.end_stamp) updateData.end_time = callData.end_stamp;
    if (callData.duration !== null) updateData.duration = callData.duration;
    if (callData.hangup_cause) updateData.notes = callData.hangup_cause;
    if (callData.recording_url) updateData.metadata = { recording_url: callData.recording_url };
    if (callData.call_quality) updateData.call_quality = callData.call_quality;
    
    if (existingCall) {
      // Update existing call log
      const { error: updateError } = await supabaseAdmin
        .from('call_logs')
        .update(updateData)
        .eq('call_id', callData.call_id);
      
      if (updateError) {
        console.error('Error updating call log:', updateError);
      } else {
        console.log('✅ Call log updated successfully:', callData.call_id);
      }
    } else {
      // Create new call log (this shouldn't happen often as we log incoming calls)
      const { error: insertError } = await supabaseAdmin
        .from('call_logs')
        .insert({
          call_id: callData.call_id,
          uuid: callData.uuid,
          caller_number: callData.caller_id_number || '',
          called_number: callData.call_to_number || '',
          call_type: CALL_TYPES.CUSTOMER_TO_PARTNER,
          status: callData.status,
          start_time: callData.start_stamp,
          end_time: callData.end_stamp,
          duration: callData.duration,
          call_quality: callData.call_quality,
          notes: callData.hangup_cause,
          metadata: callData.recording_url ? { recording_url: callData.recording_url } : {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating call log:', insertError);
      } else {
        console.log('✅ Call log created successfully:', callData.call_id);
      }
    }
    
  } catch (error) {
    console.error('Error in updateCallLog:', error);
  }
}
