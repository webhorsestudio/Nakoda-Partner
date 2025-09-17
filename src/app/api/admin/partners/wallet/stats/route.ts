import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/admin/partners/wallet/stats
 * Get wallet statistics for admin dashboard
 */
export async function GET() {
  try {
    // Get total wallet statistics
    const { data: walletStats, error: walletError } = await supabase
      .from('partners')
      .select('wallet_balance, wallet_status');

    if (walletError) {
      throw new Error(`Wallet stats error: ${walletError.message}`);
    }

    // Calculate statistics
    const totalPartners = walletStats?.length || 0;
    const totalWalletBalance = walletStats?.reduce((sum, partner) => sum + (partner.wallet_balance || 0), 0) || 0;

    // Count by wallet status
    const statusCounts = walletStats?.reduce((acc, partner) => {
      const status = partner.wallet_status || 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get partners with zero balance
    const zeroBalancePartners = walletStats?.filter(partner => (partner.wallet_balance || 0) === 0).length || 0;

    // Get partners with high balance (> ₹10,000)
    const highBalancePartners = walletStats?.filter(partner => (partner.wallet_balance || 0) > 10000).length || 0;

    // Get recent transactions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentTransactions, error: transactionError } = await supabase
      .from('wallet_transactions')
      .select('amount, transaction_type, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .eq('status', 'completed');

    if (transactionError) {
      console.error('Error fetching recent transactions:', transactionError);
    }

    const totalTransactions = recentTransactions?.length || 0;
    const totalTransactionAmount = recentTransactions?.reduce((sum, tx) => {
      return tx.transaction_type === 'credit' ? sum + tx.amount : sum - tx.amount;
    }, 0) || 0;

    // Get top partners by wallet balance
    const { data: topPartners, error: topPartnersError } = await supabase
      .from('partners')
      .select('id, name, wallet_balance, service_type, city')
      .order('wallet_balance', { ascending: false })
      .limit(5);

    if (topPartnersError) {
      console.error('Error fetching top partners:', topPartnersError);
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalPartners,
          totalWalletBalance,
          averageBalance: totalPartners > 0 ? totalWalletBalance / totalPartners : 0
        },
        statusBreakdown: {
          active: statusCounts.active || 0,
          suspended: statusCounts.suspended || 0,
          frozen: statusCounts.frozen || 0,
          closed: statusCounts.closed || 0
        },
        balanceDistribution: {
          zeroBalance: zeroBalancePartners,
          highBalance: highBalancePartners,
          normalBalance: totalPartners - zeroBalancePartners - highBalancePartners
        },
        recentActivity: {
          totalTransactions,
          totalTransactionAmount,
          period: '7 days'
        },
        topPartners: topPartners || []
      }
    });

  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch wallet statistics'
      },
      { status: 500 }
    );
  }
}
