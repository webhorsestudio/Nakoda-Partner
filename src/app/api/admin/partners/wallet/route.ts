import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface PartnerWalletFilters {
  search?: string;
  wallet_status?: string;
  service_type?: string;
  city?: string;
  verification_status?: string;
  min_balance?: number;
  max_balance?: number;
  page?: number;
  limit?: number;
}

/**
 * GET /api/admin/partners/wallet
 * Get all partners with wallet information and filtering
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filters from query parameters
    const filters: PartnerWalletFilters = {
      search: searchParams.get('search') || undefined,
      wallet_status: searchParams.get('wallet_status') || undefined,
      service_type: searchParams.get('service_type') || undefined,
      city: searchParams.get('city') || undefined,
      verification_status: searchParams.get('verification_status') || undefined,
      min_balance: searchParams.get('min_balance') ? parseFloat(searchParams.get('min_balance')!) : undefined,
      max_balance: searchParams.get('max_balance') ? parseFloat(searchParams.get('max_balance')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    };

    // Build the query
    let query = supabase
      .from('partners')
      .select(`
        id,
        name,
        code,
        mobile,
        email,
        city,
        service_type,
        status,
        verification_status,
        wallet_balance,
        wallet_status,
        last_transaction_at,
        wallet_created_at,
        wallet_updated_at,
        total_orders,
        total_revenue,
        rating,
        joined_date,
        last_active
      `);

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,mobile.ilike.%${filters.search}%,email.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
    }

    if (filters.wallet_status) {
      query = query.eq('wallet_status', filters.wallet_status);
    }

    if (filters.service_type) {
      query = query.eq('service_type', filters.service_type);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.verification_status) {
      query = query.eq('verification_status', filters.verification_status);
    }

    if (filters.min_balance !== undefined) {
      query = query.gte('wallet_balance', filters.min_balance);
    }

    if (filters.max_balance !== undefined) {
      query = query.lte('wallet_balance', filters.max_balance);
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Count error: ${countError.message}`);
    }

    // Apply pagination
    const offset = ((filters.page || 1) - 1) * (filters.limit || 20);
    query = query.range(offset, offset + (filters.limit || 20) - 1);

    // Order by wallet balance descending
    query = query.order('wallet_balance', { ascending: false });

    const { data: partners, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / (filters.limit || 20));

    return NextResponse.json({
      success: true,
      data: partners || [],
      pagination: {
        currentPage: filters.page || 1,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: filters.limit || 20
      },
      filters
    });

  } catch (error) {
    console.error('Error fetching partner wallets:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch partner wallets'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/partners/wallet
 * Add balance to a partner's wallet
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partnerId, amount, type, description } = body;

    if (!partnerId || !amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Partner ID and valid amount are required'
        },
        { status: 400 }
      );
    }

    // Validate transaction type
    const validTypes = ['credit', 'debit', 'adjustment'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid transaction type is required (credit, debit, adjustment)'
        },
        { status: 400 }
      );
    }

    // Get current partner wallet balance
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('wallet_balance, name')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Partner not found'
        },
        { status: 404 }
      );
    }

    // Calculate new balance based on transaction type
    let newWalletBalance = partner.wallet_balance;

    if (type === 'credit') {
      newWalletBalance += amount;
    } else if (type === 'debit') {
      if (newWalletBalance < amount) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient wallet balance for debit transaction'
          },
          { status: 400 }
        );
      }
      newWalletBalance -= amount;
    } else if (type === 'adjustment') {
      newWalletBalance = amount;
    }

    // Update partner wallet balance
    const { error: updateError } = await supabase
      .from('partners')
      .update({
        wallet_balance: newWalletBalance,
        last_transaction_at: new Date().toISOString(),
        wallet_updated_at: new Date().toISOString()
      })
      .eq('id', partnerId);

    if (updateError) {
      throw new Error(`Update error: ${updateError.message}`);
    }

    // Create wallet transaction record
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        partner_id: partnerId,
        transaction_type: type,
        amount: amount,
        balance_before: partner.wallet_balance,
        balance_after: newWalletBalance,
        description: description || `Admin ${type} transaction`,
        status: 'completed',
        metadata: { created_by: 'admin' },
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('Error creating wallet transaction:', transactionError);
      // Don't fail the request if transaction record fails
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${type}ed ₹${amount} to ${partner.name}'s wallet`,
      data: {
        partnerId,
        previousBalance: partner.wallet_balance,
        newBalance: newWalletBalance,
        transactionType: type,
        amount
      }
    });

  } catch (error) {
    console.error('Error updating partner wallet:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update partner wallet'
      },
      { status: 500 }
    );
  }
}