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
    const { amount, bankAccountId, description, metadata } = await request.json();

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!bankAccountId) {
      return NextResponse.json({ error: 'Bank account is required' }, { status: 400 });
    }

    if (amount < 100) { // Minimum withdrawal amount
      return NextResponse.json({ error: 'Minimum withdrawal amount is ₹100' }, { status: 400 });
    }

    if (amount > 50000) { // Maximum withdrawal amount
      return NextResponse.json({ error: 'Maximum withdrawal amount is ₹50,000' }, { status: 400 });
    }

    // Check if partner exists and wallet is active
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, wallet_status, available_balance')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    if (partner.wallet_status !== 'active') {
      return NextResponse.json({ error: 'Wallet is not active' }, { status: 400 });
    }

    // Check if sufficient balance
    const availableBalance = parseFloat(partner.available_balance || 0);
    if (amount > availableBalance) {
      return NextResponse.json({ 
        error: 'Insufficient balance', 
        details: { 
          requested: amount, 
          available: availableBalance 
        } 
      }, { status: 400 });
    }

    // Calculate processing fee (₹10 or 1%, whichever is higher)
    const processingFee = Math.max(10, Math.round(amount * 0.01));
    const totalDeduction = amount + processingFee;

    if (totalDeduction > availableBalance) {
      return NextResponse.json({ 
        error: 'Insufficient balance for withdrawal including processing fee', 
        details: { 
          requested: amount, 
          processingFee: processingFee,
          totalDeduction: totalDeduction,
          available: availableBalance 
        } 
      }, { status: 400 });
    }

    // Add withdrawal transaction
    const { data: transactionResult, error: transactionError } = await supabase
      .rpc('add_wallet_transaction', {
        p_partner_id: partnerId,
        p_transaction_type: 'debit',
        p_amount: totalDeduction,
        p_description: description || `Withdrawal of ₹${amount} to bank account ${bankAccountId}`,
        p_reference_id: `WTH-${Date.now()}`,
        p_reference_type: 'withdrawal',
        p_metadata: {
          withdrawalAmount: amount,
          processingFee: processingFee,
          bankAccountId: bankAccountId,
          ...metadata
        }
      });

    if (transactionError) {
      console.error('Error processing withdrawal:', transactionError);
      return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 });
    }

    // Get updated balance
    const { data: updatedPartner, error: balanceError } = await supabase
      .from('partners')
      .select('wallet_balance, available_balance, last_transaction_at')
      .eq('id', partnerId)
      .single();

    if (balanceError) {
      console.error('Error fetching updated balance:', balanceError);
    }

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transactionResult,
        withdrawalAmount: amount,
        processingFee: processingFee,
        totalDeduction: totalDeduction,
        newBalance: parseFloat(updatedPartner?.wallet_balance || 0),
        availableBalance: parseFloat(updatedPartner?.available_balance || 0),
        lastTransactionAt: updatedPartner?.last_transaction_at
      },
      message: `Withdrawal request submitted. ₹${amount} will be transferred to your bank account within 1-3 business days.`
    });

  } catch (error) {
    console.error('Withdraw API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
