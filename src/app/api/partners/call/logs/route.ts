import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Verify partner authentication
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const partnerId = authResult.userId;
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query for call logs
    let query = supabase
      .from('call_logs')
      .select('*')
      .eq('partner_id', partnerId)
      .order('start_time', { ascending: false })
      .limit(limit);

    // Filter by order ID if provided
    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data: callLogs, error } = await query;

    if (error) {
      console.error('Error fetching call logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch call logs', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      callLogs: callLogs || [],
      total: callLogs?.length || 0
    });

  } catch (error) {
    console.error('Error in call logs API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
