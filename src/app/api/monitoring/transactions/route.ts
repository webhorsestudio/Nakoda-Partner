// Transaction Monitoring API Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { TransactionMonitor } from '@/utils/transactionMonitor';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const partnerId = url.searchParams.get('partnerId');
    const action = url.searchParams.get('action') || 'metrics';

    switch (action) {
      case 'metrics':
        const metrics = await TransactionMonitor.getTransactionMetrics(partnerId || undefined);
        return NextResponse.json({ success: true, data: metrics });

      case 'alerts':
        const alerts = await TransactionMonitor.checkAlerts(partnerId || undefined);
        return NextResponse.json({ success: true, data: alerts });

      case 'report':
        const report = await TransactionMonitor.generateTransactionReport(partnerId || undefined);
        return NextResponse.json({ success: true, data: report });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Transaction monitoring API error:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
