import { NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService';

export async function POST() {
  try {
    const orderService = new OrderService();
    
    const result = await orderService.cleanupInvalidOrders();
    
    return NextResponse.json({
      success: true,
      message: `Cleanup completed: ${result.removed} orders removed, ${result.errors} errors`,
      data: result
    });
  } catch (error) {
    console.error("Error in cleanup endpoint:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to cleanup invalid orders",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
