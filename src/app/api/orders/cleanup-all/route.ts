import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // ⚠️ WARNING: This will delete ALL orders from the database
    const { error } = await supabase
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all orders

    if (error) {
      console.error('Error cleaning up orders:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to clean up orders', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'All orders have been cleared from the database. You can now re-sync from Bitrix24 to get fresh data with the new time slot logic.',
      deletedCount: 'All orders deleted'
    });

  } catch (error) {
    console.error('Error in cleanup-all API:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clean up orders', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
