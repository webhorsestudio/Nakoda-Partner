import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPartnerToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify partner authentication
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = authResult.userId;

    // Parse request body
    const { amount, description, referenceId, metadata } = await request.json();

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (amount > 100000) { // Max 1 lakh per transaction
      return NextResponse.json({ error: 'Amount exceeds maximum limit' }, { status: 400 });
    }

    // Check if partner exists and wallet is active
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, wallet_status, wallet_balance')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    if (partner.wallet_status !== 'active') {
      return NextResponse.json({ error: 'Wallet is not active' }, { status: 400 });
    }

    // Add wallet transaction using the stored procedure
    const { data: transactionResult, error: transactionError } = await supabase
      .rpc('add_wallet_transaction', {
        p_partner_id: partnerId,
        p_transaction_type: 'credit',
        p_amount: amount,
        p_description: description || `Wallet top-up of ₹${amount}`,
        p_reference_id: referenceId,
        p_reference_type: 'manual_add',
        p_metadata: metadata || {}
      });

    if (transactionError) {
      console.error('Error adding wallet transaction:', transactionError);
      return NextResponse.json({ error: 'Failed to add amount to wallet' }, { status: 500 });
    }

    // Get updated balance
    const { data: updatedPartner, error: balanceError } = await supabase
      .from('partners')
      .select('wallet_balance, last_transaction_at')
      .eq('id', partnerId)
      .single();

    if (balanceError) {
      console.error('Error fetching updated balance:', balanceError);
    }

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transactionResult,
        newBalance: parseFloat(updatedPartner?.wallet_balance || 0),
        lastTransactionAt: updatedPartner?.last_transaction_at
      },
      message: `Successfully added ₹${amount} to wallet`
    });

  } catch (error) {
    console.error('Add amount API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
