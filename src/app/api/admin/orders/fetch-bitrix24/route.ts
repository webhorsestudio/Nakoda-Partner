import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { professionalBitrix24Service } from '@/services/professionalBitrix24Service';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const { orderNumber } = await request.json();

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order Number is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Admin requesting Bitrix24 deal by Order Number: ${orderNumber}`);

    // First, let's try to get a list of recent deals to see which ones have data
    console.log(`🔍 Fetching recent deals to find ones with data...`);
    const recentDeals = await professionalBitrix24Service.fetchDeals(0, 5);
    const recentDealsSample = recentDeals.result?.slice(0, 3).map(deal => ({
      ID: deal.ID,
      TITLE: deal.TITLE,
      orderNumber: deal.UF_CRM_1681649038953,
      customerName: deal.UF_CRM_1681645659170,
      amount: deal.UF_CRM_1681648179537
    }));
    console.log(`📊 Recent deals sample:`, recentDealsSample);

    // Fetch deal by order number using the new method
    const foundDeal = await professionalBitrix24Service.fetchDealByOrderNumber(orderNumber);

    if (!foundDeal) {
      console.log(`❌ Deal with Order Number ${orderNumber} not found in Bitrix24`);
      const validOrderNumbers = recentDealsSample?.map(deal => deal.orderNumber).filter(Boolean).join(', ') || 'Nus104161, MNus101038, Nus87638';
      return NextResponse.json({
        success: false,
        error: `Deal with Order Number "${orderNumber}" not found in Bitrix24`,
        suggestion: `Try these recent order numbers with data: ${validOrderNumbers}`,
        recentDeals: recentDealsSample
      });
    }

    console.log(`✅ Found deal: ${foundDeal.ID} for Order Number: ${orderNumber}`);
    console.log(`📊 Raw deal data:`, {
      ID: foundDeal.ID,
      TITLE: foundDeal.TITLE,
      STAGE_ID: foundDeal.STAGE_ID,
      orderNumber: foundDeal.UF_CRM_1681649038953,
      customerName: foundDeal.UF_CRM_1681645659170,
      customerPhone: foundDeal.UF_CRM_1681974166046,
      address: foundDeal.UF_CRM_1681747087033,
      amount: foundDeal.UF_CRM_1681648179537,
      package: foundDeal.UF_CRM_1681749732453,
      serviceDate: foundDeal.UF_CRM_1681648036958,
      timeSlot: foundDeal.UF_CRM_1681747291577,
      commission: foundDeal.UF_CRM_1681648200083,
      advanceAmount: foundDeal.UF_CRM_1681648284105,
      taxesAndFees: foundDeal.UF_CRM_1723904458952
    });

    // Check if the deal has any custom field data
    const hasCustomData = foundDeal.UF_CRM_1681649038953 || 
                         foundDeal.UF_CRM_1681645659170 || 
                         foundDeal.UF_CRM_1681974166046 || 
                         foundDeal.UF_CRM_1681747087033 || 
                         foundDeal.UF_CRM_1681648179537;

    if (!hasCustomData) {
      console.log(`⚠️ Deal with Order Number ${orderNumber} exists but has no custom field data populated`);
      const validOrderNumbers = recentDealsSample?.map(deal => deal.orderNumber).filter(Boolean).join(', ') || 'Nus104161, MNus101038, Nus87638';
      return NextResponse.json({
        success: false,
        error: `Deal with Order Number ${orderNumber} exists but has no order data populated. This might be a lead or incomplete deal.`,
        suggestion: `Try these recent order numbers with data: ${validOrderNumbers}`,
        recentDeals: recentDealsSample
      });
    }

    // Transform the deal to order details format
    const orderDetails = {
      id: foundDeal.ID,
      bitrix24Id: foundDeal.ID,
      orderNumber: foundDeal.UF_CRM_1681649038953 || 'N/A',
      title: foundDeal.TITLE || 'Service Request',
      amount: parseFloat((foundDeal.UF_CRM_1681648179537 || '0|INR').split('|')[0]) || 0,
      currency: (foundDeal.UF_CRM_1681648179537 || '0|INR').split('|')[1] || 'INR',
      customerName: foundDeal.UF_CRM_1681645659170 || 'Unknown Customer',
      customerPhone: foundDeal.UF_CRM_1681974166046 || '',
      address: foundDeal.UF_CRM_1681747087033 || '',
      city: '', // Will be extracted from address
      pinCode: '', // Will be extracted from address
      serviceDate: foundDeal.UF_CRM_1681648036958 || '',
      timeSlot: foundDeal.UF_CRM_1681747291577 || foundDeal.UF_CRM_1681647842342 || '',
      package: (foundDeal.UF_CRM_1681749732453 || '').split(' By : ')[0] || 'Unknown Package',
      partner: (foundDeal.UF_CRM_1681749732453 || '').split(' By : ')[1] || undefined,
      status: mapStageToStatus(foundDeal.STAGE_ID),
      stageId: foundDeal.STAGE_ID,
      commission: foundDeal.UF_CRM_1681648200083 || '',
      advanceAmount: parseFloat((foundDeal.UF_CRM_1681648284105 || '0|INR').split('|')[0]) || 0,
      vendorAmount: foundDeal.UF_CRM_1681649447600 || '', // Add vendor amount field
      taxesAndFees: foundDeal.UF_CRM_1723904458952 || '',
      serviceType: (foundDeal.UF_CRM_1681749732453 || '').split(' By : ')[0] || 'Unknown Service',
      mode: 'online', // Default mode
      specification: foundDeal.UF_CRM_1681648220910 || '',
    };

    // Parse address components
    if (orderDetails.address) {
      const addressParts = orderDetails.address.split(',').map(part => part.trim());
      
      // Extract pin code (last numeric part)
      const pinCodeMatch = orderDetails.address.match(/(\d{6})/);
      if (pinCodeMatch) {
        orderDetails.pinCode = pinCodeMatch[1];
      }
      
      // Extract city (look for meaningful city name, not just numbers)
      for (let i = addressParts.length - 1; i >= 0; i--) {
        const part = addressParts[i].trim();
        // Skip if it's just a pin code (6 digits) or empty
        if (part.match(/^\d{6}$/) || part === '') {
          continue;
        }
        // If we find a meaningful city name, use it
        if (part.length > 2 && !part.match(/^\d+$/)) {
          orderDetails.city = part;
          break;
        }
      }
      
      // Clean up address by removing just the pin code from the end
      orderDetails.address = orderDetails.address.replace(/\s*,?\s*\d{6}\s*,?\s*$/, '').replace(/,\s*,/g, ',').trim();
    }

    console.log(`✅ Successfully fetched order details for Order Number: ${orderNumber}`);
      console.log('Order details:', {
        id: orderDetails.id,
        orderNumber: orderDetails.orderNumber,
        title: orderDetails.title,
        amount: orderDetails.amount,
        customerName: orderDetails.customerName,
        package: orderDetails.package,
        partner: orderDetails.partner,
        status: orderDetails.status,
        timeSlot: orderDetails.timeSlot,
        serviceDate: orderDetails.serviceDate,
        address: orderDetails.address,
        city: orderDetails.city,
        pinCode: orderDetails.pinCode
      });

    return NextResponse.json({
      success: true,
      orderDetails
    });

  } catch (error) {
    console.error('Error fetching order from Bitrix24:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch order from Bitrix24', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Helper function to map Bitrix24 stage to status
function mapStageToStatus(stageId: string): string {
  switch (stageId) {
    case 'C2:PREPAYMENT_INVOICE':
      return 'pending';
    case 'C2:EXECUTING':
      return 'in_progress';
    case 'C2:FINAL_INVOICE':
      return 'completed';
    case 'C2:WON':
      return 'completed';
    case 'C2:LOSE':
      return 'cancelled';
    default:
      return 'pending';
  }
}
