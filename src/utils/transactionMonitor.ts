// Transaction Monitoring and Logging System
import { createClient } from '@supabase/supabase-js';
import { SecurityUtils } from '@/utils/securityUtils';
import { environmentConfig } from '@/config/environment';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface TransactionMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalAmount: number;
  averageAmount: number;
  successRate: number;
  last24Hours: {
    transactions: number;
    amount: number;
  };
  last7Days: {
    transactions: number;
    amount: number;
  };
}

export interface AlertThresholds {
  maxDailyTransactions: number;
  maxDailyAmount: number;
  minSuccessRate: number;
  maxFailureRate: number;
}

export class TransactionMonitor {
  private static alertThresholds: AlertThresholds = {
    maxDailyTransactions: 1000,
    maxDailyAmount: 10000000, // ₹1 crore
    minSuccessRate: 95, // 95% success rate
    maxFailureRate: 5, // 5% failure rate
  };

  /**
   * Log transaction attempt
   */
  static async logTransactionAttempt(
    partnerId: string,
    amount: number,
    paymentMethod: string,
    orderId?: string
  ): Promise<void> {
    try {
      const logEntry = {
        partner_id: partnerId,
        transaction_type: 'attempt',
        amount: amount,
        description: `Payment attempt via ${paymentMethod}`,
        reference_id: orderId || SecurityUtils.generateSecureTransactionId(),
        reference_type: 'razorpay_order',
        status: 'pending',
        metadata: {
          payment_method: paymentMethod,
          attempt_timestamp: new Date().toISOString(),
          environment: environmentConfig.razorpay.environment
        },
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('wallet_transactions')
        .insert(logEntry);

      if (error) {
        console.error('❌ Failed to log transaction attempt:', error.message);
      } else {
        console.log('✅ Transaction attempt logged:', logEntry.reference_id);
      }
    } catch (error) {
      console.error('❌ Error logging transaction attempt:', error);
    }
  }

  /**
   * Log transaction completion
   */
  static async logTransactionCompletion(
    partnerId: string,
    amount: number,
    status: 'completed' | 'failed',
    paymentId: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      // Update the existing attempt record
      const { data: existingTransaction } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('reference_id', paymentId)
        .eq('status', 'pending')
        .single();

      if (existingTransaction) {
        const { error: updateError } = await supabase
          .from('wallet_transactions')
          .update({
            status: status,
            metadata: {
              ...existingTransaction.metadata,
              completion_timestamp: new Date().toISOString(),
              error_message: errorMessage,
              final_status: status
            },
            processed_at: new Date().toISOString()
          })
          .eq('id', existingTransaction.id);

        if (updateError) {
          console.error('❌ Failed to update transaction completion:', updateError.message);
        }
      }

      // Log completion event
      SecurityUtils.logSecurityEvent('TRANSACTION_COMPLETED', {
        partnerId,
        amount,
        status,
        paymentId,
        errorMessage
      }, status === 'failed' ? 'high' : 'low');

    } catch (error) {
      console.error('❌ Error logging transaction completion:', error);
    }
  }

  /**
   * Get transaction metrics
   */
  static async getTransactionMetrics(
    partnerId?: string,
    days: number = 30
  ): Promise<TransactionMetrics> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      let query = supabase
        .from('wallet_transactions')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }

      const { data: transactions, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      const totalTransactions = transactions?.length || 0;
      const successfulTransactions = transactions?.filter(t => t.status === 'completed').length || 0;
      const failedTransactions = transactions?.filter(t => t.status === 'failed').length || 0;
      const totalAmount = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const averageAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;
      const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

      // Last 24 hours
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);
      const last24HoursTransactions = transactions?.filter(t => 
        new Date(t.created_at) >= last24Hours
      ) || [];
      const last24HoursAmount = last24HoursTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      // Last 7 days
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      const last7DaysTransactions = transactions?.filter(t => 
        new Date(t.created_at) >= last7Days
      ) || [];
      const last7DaysAmount = last7DaysTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        totalAmount,
        averageAmount,
        successRate,
        last24Hours: {
          transactions: last24HoursTransactions.length,
          amount: last24HoursAmount
        },
        last7Days: {
          transactions: last7DaysTransactions.length,
          amount: last7DaysAmount
        }
      };
    } catch (error) {
      console.error('❌ Error getting transaction metrics:', error);
      return {
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        totalAmount: 0,
        averageAmount: 0,
        successRate: 0,
        last24Hours: { transactions: 0, amount: 0 },
        last7Days: { transactions: 0, amount: 0 }
      };
    }
  }

  /**
   * Check for alerts and anomalies
   */
  static async checkAlerts(partnerId?: string): Promise<string[]> {
    const alerts: string[] = [];
    
    try {
      const metrics = await this.getTransactionMetrics(partnerId, 1); // Last 24 hours
      
      // Check daily transaction limit
      if (metrics.last24Hours.transactions > this.alertThresholds.maxDailyTransactions) {
        alerts.push(`High transaction volume: ${metrics.last24Hours.transactions} transactions in 24 hours`);
      }

      // Check daily amount limit
      if (metrics.last24Hours.amount > this.alertThresholds.maxDailyAmount) {
        alerts.push(`High transaction amount: ₹${metrics.last24Hours.amount} in 24 hours`);
      }

      // Check success rate
      if (metrics.successRate < this.alertThresholds.minSuccessRate) {
        alerts.push(`Low success rate: ${metrics.successRate.toFixed(2)}%`);
      }

      // Check for suspicious patterns
      if (metrics.averageAmount > 50000 && metrics.last24Hours.transactions > 10) {
        alerts.push(`Suspicious pattern: High average amount (₹${metrics.averageAmount}) with frequent transactions`);
      }

      // Log alerts
      if (alerts.length > 0) {
        SecurityUtils.logSecurityEvent('TRANSACTION_ALERTS', {
          partnerId,
          alerts,
          metrics
        }, 'high');
      }

    } catch (error) {
      console.error('❌ Error checking alerts:', error);
      alerts.push('Error checking transaction alerts');
    }

    return alerts;
  }

  /**
   * Generate transaction report
   */
  static async generateTransactionReport(
    partnerId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Record<string, unknown>> {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const end = endDate || new Date();

      let query = supabase
        .from('wallet_transactions')
        .select(`
          *,
          partners!inner(name, email, phone)
        `)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false });

      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }

      const { data: transactions, error } = await query;

      if (error) {
        throw new Error(`Failed to generate report: ${error.message}`);
      }

      const metrics = await this.getTransactionMetrics(partnerId, 30);
      const alerts = await this.checkAlerts(partnerId);

      return {
        reportPeriod: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        metrics,
        alerts,
        transactions: transactions || [],
        generatedAt: new Date().toISOString(),
        environment: environmentConfig.razorpay.environment
      };
    } catch (error) {
      console.error('❌ Error generating transaction report:', error);
      throw error;
    }
  }

  /**
   * Clean up old transaction logs (for maintenance)
   */
  static async cleanupOldLogs(daysToKeep: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await supabase
        .from('wallet_transactions')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('status', 'pending'); // Only delete pending/old attempts

      if (error) {
        console.error('❌ Failed to cleanup old logs:', error.message);
      } else {
        console.log(`✅ Cleaned up transaction logs older than ${daysToKeep} days`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up old logs:', error);
    }
  }
}

// API endpoint for transaction monitoring
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const partnerId = url.searchParams.get('partnerId');
    const action = url.searchParams.get('action') || 'metrics';

    switch (action) {
      case 'metrics':
        const metrics = await TransactionMonitor.getTransactionMetrics(partnerId || undefined);
        return Response.json({ success: true, data: metrics });

      case 'alerts':
        const alerts = await TransactionMonitor.checkAlerts(partnerId || undefined);
        return Response.json({ success: true, data: alerts });

      case 'report':
        const report = await TransactionMonitor.generateTransactionReport(partnerId || undefined);
        return Response.json({ success: true, data: report });

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Transaction monitoring API error:', error);
    return Response.json({ 
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
