import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPartnerToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify partner authentication
    const authResult = await verifyPartnerToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    // Calculate 24 hours ago timestamp
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const twentyFourHoursAgoISO = twentyFourHoursAgo.toISOString();

    // Find and delete orders older than 24 hours that are still pending
    const { data: oldOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, title, date_created')
      .eq('status', 'pending')
      .is('partner_id', null)
      .lt('date_created', twentyFourHoursAgoISO);

    if (fetchError) {
      console.error('Error fetching old orders:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch old orders', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!oldOrders || oldOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No old orders to clean up',
        deletedCount: 0
      });
    }

    // Delete old orders
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('status', 'pending')
      .is('partner_id', null)
      .lt('date_created', twentyFourHoursAgoISO);

    if (deleteError) {
      console.error('Error deleting old orders:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete old orders', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${oldOrders.length} old orders`,
      deletedCount: oldOrders.length,
      deletedOrders: oldOrders.map(order => ({
        id: order.id,
        title: order.title,
        date_created: order.date_created
      }))
    });

  } catch (error) {
    console.error('Error in cleanup-old-orders API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
