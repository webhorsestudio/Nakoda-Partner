import { NextRequest, NextResponse } from 'next/server';
import { ACEFONE_CONFIG } from '@/config/acefone';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('type') || 'config';

  try {
    switch (testType) {
      case 'config':
        return NextResponse.json({
          success: true,
          message: 'Acefone Configuration Check',
          config: {
            didNumber: ACEFONE_CONFIG.DID_NUMBER,
            webhookUrl: ACEFONE_CONFIG.API_DIALPLAN.WEBHOOK_URL,
            requestMethod: ACEFONE_CONFIG.API_DIALPLAN.REQUEST_METHOD,
            failoverDestination: ACEFONE_CONFIG.API_DIALPLAN.FAILOVER_DESTINATION,
            ringType: ACEFONE_CONFIG.CALL_SETTINGS.RING_TYPE,
            skipActive: ACEFONE_CONFIG.CALL_SETTINGS.SKIP_ACTIVE,
            callTimeout: ACEFONE_CONFIG.CALL_SETTINGS.CALL_TIMEOUT
          },
          instructions: {
            step1: 'Configure Acefone API Dialplan with the webhook URL above',
            step2: 'Set DID number in Acefone console',
            step3: 'Test by calling the DID number',
            step4: 'Check logs for call routing'
          }
        });

      case 'test-dialplan':
        const testPayload = {
          uuid: `test-uuid-${Date.now()}`,
          call_id: `test-call-${Date.now()}`,
          call_to_number: ACEFONE_CONFIG.DID_NUMBER,
          caller_id_number: '919876543210', // Test customer number
          start_stamp: new Date().toISOString()
        };

        // Test the dialplan endpoint internally
        const dialplanResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/acefone-dialplan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testPayload),
        });

        const dialplanResult = await dialplanResponse.json();

        return NextResponse.json({
          success: true,
          message: 'Dialplan Test Completed',
          testPayload,
          dialplanResponse: dialplanResult,
          status: dialplanResponse.status
        });

      case 'test-webhook':
        const webhookPayload = {
          $uuid: `test-uuid-${Date.now()}`,
          $call_id: `test-call-${Date.now()}`,
          $call_status: 'answered',
          $start_time: new Date(Date.now() - 30000).toISOString(),
          $end_time: new Date().toISOString(),
          $duration: '20',
          $caller_id_number: '919876543210',
          $call_to_number: ACEFONE_CONFIG.DID_NUMBER,
          $agent_number: '919326499348'
        };

        // Test the webhook endpoint internally
        const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/acefone-webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });

        const webhookResult = await webhookResponse.json();

        return NextResponse.json({
          success: true,
          message: 'Webhook Test Completed',
          webhookPayload,
          webhookResponse: webhookResult,
          status: webhookResponse.status
        });

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid test type. Use: config, test-dialplan, or test-webhook',
          availableTests: [
            'GET /api/test-masked-calling?type=config',
            'GET /api/test-masked-calling?type=test-dialplan', 
            'GET /api/test-masked-calling?type=test-webhook'
          ]
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Error in test-masked-calling:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}