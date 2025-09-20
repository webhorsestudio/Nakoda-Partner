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

    // Get partner profile information
    const { data: partner, error } = await supabase
      .from('partners')
      .select(`
        id,
        name,
        email,
        mobile,
        phone,
        city,
        state,
        service_type,
        status,
        verification_status,
        wallet_balance,
        wallet_status,
        created_at,
        updated_at
      `)
      .eq('id', partnerId)
      .single();

    if (error) {
      console.error('Error fetching partner profile:', error);
      return NextResponse.json({ error: 'Failed to fetch partner profile' }, { status: 500 });
    }

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        mobile: partner.mobile,
        phone: partner.phone,
        city: partner.city,
        state: partner.state,
        service_type: partner.service_type,
        status: partner.status,
        verification_status: partner.verification_status,
        wallet_balance: partner.wallet_balance,
        wallet_status: partner.wallet_status,
        created_at: partner.created_at,
        updated_at: partner.updated_at
      }
    });

  } catch (error) {
    console.error('Partner profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
