// Error Monitoring API Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { ErrorMonitor } from '@/utils/errorMonitor';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'stats';
    const hours = parseInt(url.searchParams.get('hours') || '24');

    switch (action) {
      case 'stats':
        const stats = ErrorMonitor.getAlertStatistics();
        return NextResponse.json({ success: true, data: stats });

      case 'recent':
        const recentAlerts = ErrorMonitor.getRecentAlerts(hours);
        return NextResponse.json({ success: true, data: recentAlerts });

      case 'unresolved':
        const unresolvedAlerts = ErrorMonitor.getUnresolvedAlerts();
        return NextResponse.json({ success: true, data: unresolvedAlerts });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Error monitoring API error:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
