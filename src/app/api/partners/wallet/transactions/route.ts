import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPartnerToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify partner authentication
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = authResult.userId;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Build query
    let query = supabase
      .from('wallet_transactions')
      .select(`
        id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        description,
        reference_id,
        reference_type,
        status,
        metadata,
        processed_at,
        created_at
      `)
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (type) {
      query = query.eq('transaction_type', type);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: transactions, error, count } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactions || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('Transactions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
