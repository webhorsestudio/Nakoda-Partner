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

    // Get partner wallet balance
    const { data: partner, error } = await supabase
      .from('partners')
      .select(`
        id,
        name,
        wallet_balance,
        wallet_status,
        last_transaction_at
      `)
      .eq('id', partnerId)
      .single();

    if (error) {
      console.error('Error fetching partner wallet:', error);
      return NextResponse.json({ error: 'Failed to fetch wallet balance' }, { status: 500 });
    }

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Debug logging
    console.log('Partner wallet data:', {
      partnerId: partner.id,
      partnerName: partner.name,
      wallet_balance: partner.wallet_balance,
      wallet_status: partner.wallet_status
    });

    // Use the existing wallet_balance field, default to 0 if null
    const walletBalance = partner.wallet_balance !== null ? parseFloat(partner.wallet_balance) : 0;

    return NextResponse.json({
      success: true,
      data: {
        partnerId: partner.id,
        partnerName: partner.name,
        walletBalance: walletBalance,
        availableBalance: walletBalance, // Same as wallet balance
        pendingBalance: 0, // No pending balance concept
        walletStatus: partner.wallet_status || 'active',
        lastTransactionAt: partner.last_transaction_at
      }
    });

  } catch (error) {
    console.error('Wallet balance API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
