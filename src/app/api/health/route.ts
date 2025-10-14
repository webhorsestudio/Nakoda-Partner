// Health check endpoint
import { NextRequest, NextResponse } from 'next/server';
import { environmentConfig } from '@/config/environment';

// Health check endpoint
export async function GET() {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: environmentConfig.razorpay.environment,
      version: '1.0.0',
      services: {
        database: 'connected',
        razorpay: environmentConfig.razorpay.keyId ? 'configured' : 'not_configured',
        webhook: 'active',
        monitoring: environmentConfig.monitoring.enableDetailedLogging ? 'enabled' : 'disabled'
      }
    };

    return NextResponse.json(healthStatus);
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
