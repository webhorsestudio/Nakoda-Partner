import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { watiService } from '@/services/watiService';
import { OrderData, PartnerOrderData } from '@/config/wati';

export async function POST(request: NextRequest) {
  try {
    // Admin-only authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderData, messageType } = body;

    // Validate required fields
    if (!orderData || !messageType) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'orderData and messageType are required' },
        { status: 400 }
      );
    }

    // Validate phone number based on message type
    let phoneNumber: string;
    if (messageType === 'partner') {
      const partnerOrderData = orderData as PartnerOrderData;
      console.log(`📱 Partner phone number received: ${partnerOrderData.partnerPhone}`);
      
      if (!watiService.isValidPhoneNumber(partnerOrderData.partnerPhone)) {
        console.error(`❌ Invalid partner phone number: ${partnerOrderData.partnerPhone}`);
        return NextResponse.json(
          { error: 'Invalid partner phone number', message: 'Please provide a valid partner phone number' },
          { status: 400 }
        );
      }
      phoneNumber = watiService.formatPhoneNumber(partnerOrderData.partnerPhone);
      console.log(`📱 Formatted partner phone number: ${phoneNumber}`);
      partnerOrderData.partnerPhone = phoneNumber;
    } else {
      if (!watiService.isValidPhoneNumber(orderData.customerPhone)) {
        return NextResponse.json(
          { error: 'Invalid phone number', message: 'Please provide a valid phone number' },
          { status: 400 }
        );
      }
      phoneNumber = watiService.formatPhoneNumber(orderData.customerPhone);
      orderData.customerPhone = phoneNumber;
    }

    let result;

    // Send appropriate message based on type
    switch (messageType) {
      case 'pipeline':
        result = await watiService.sendPipelineMessage(orderData as OrderData);
        break;
      case 'final_confirmation':
        result = await watiService.sendFinalConfirmationMessage(orderData as OrderData);
        break;
      case 'partner':
        result = await watiService.sendPartnerMessage(orderData as PartnerOrderData);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid message type', message: 'messageType must be "pipeline", "final_confirmation", or "partner"' },
          { status: 400 }
        );
    }

    if (result.success) {
      console.log(`✅ WATI message sent successfully to ${phoneNumber}`);
      return NextResponse.json({
        success: true,
        message: result.message,
        phoneNumber: phoneNumber,
        messageType: messageType
      });
    } else {
      console.error(`❌ WATI message failed for ${phoneNumber}:`, result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          phoneNumber: phoneNumber,
          messageType: messageType
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in WATI API route:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
