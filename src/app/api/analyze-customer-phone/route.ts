import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Comprehensive Analysis of Customer Number Issue');
    
    // Get Webhorse Studio partner details
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('partners')
      .select('id, name, mobile, status')
      .eq('id', 829)
      .single();
    
    if (partnerError) {
      console.error('❌ Error fetching partner:', partnerError);
      return NextResponse.json({ success: false, error: partnerError.message });
    }
    
    console.log('📋 Partner Details:', partner);
    
    // Get all orders for Webhorse Studio
    const { data: orders, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, customer_name, mobile_number, status, service_date, time_slot, created_at')
      .eq('partner_id', 829)
      .order('created_at', { ascending: false });
    
    if (orderError) {
      console.error('❌ Error fetching orders:', orderError);
      return NextResponse.json({ success: false, error: orderError.message });
    }
    
    console.log('📋 All Orders for Webhorse Studio:', orders);
    
    // Get active orders
    const activeOrders = orders?.filter(order => 
      ['assigned', 'in_progress', 'accepted'].includes(order.status)
    ) || [];
    
    console.log('✅ Active Orders:', activeOrders);
    
    if (activeOrders.length > 0) {
      const targetOrder = activeOrders[0];
      console.log('🎯 Target Order for Call Masking:', targetOrder);
      
      // Analyze the customer phone number
      const customerPhone = targetOrder.mobile_number;
      console.log('📞 Raw Customer Phone from DB:', customerPhone);
      console.log('📞 Customer Phone Type:', typeof customerPhone);
      console.log('📞 Customer Phone Length:', customerPhone?.length);
      
      // Test different phone formatting approaches
      const phoneFormats = [];
      
      if (customerPhone) {
        // Original format
        phoneFormats.push({
          name: 'Original from DB',
          value: customerPhone,
          length: customerPhone.length
        });
        
        // Remove any non-digits
        const cleaned = customerPhone.replace(/\D/g, '');
        phoneFormats.push({
          name: 'Cleaned (digits only)',
          value: cleaned,
          length: cleaned.length
        });
        
        // Add +91 if not present
        let withCountryCode = customerPhone;
        if (!customerPhone.startsWith('+91') && !customerPhone.startsWith('91')) {
          withCountryCode = `+91${cleaned}`;
        } else if (customerPhone.startsWith('91') && !customerPhone.startsWith('+91')) {
          withCountryCode = `+${customerPhone}`;
        }
        phoneFormats.push({
          name: 'With +91 country code',
          value: withCountryCode,
          length: withCountryCode.length
        });
        
        // 10-digit format
        let tenDigit = cleaned;
        if (cleaned.length === 12 && cleaned.startsWith('91')) {
          tenDigit = cleaned.substring(2);
        } else if (cleaned.length > 10) {
          tenDigit = cleaned.slice(-10);
        }
        phoneFormats.push({
          name: '10-digit format',
          value: tenDigit,
          length: tenDigit.length
        });
        
        console.log('📞 Phone Format Analysis:', phoneFormats);
      }
      
      return NextResponse.json({
        success: true,
        partner: partner,
        allOrders: orders,
        activeOrders: activeOrders,
        targetOrder: targetOrder,
        customerPhoneAnalysis: {
          raw: customerPhone,
          type: typeof customerPhone,
          length: customerPhone?.length,
          formats: phoneFormats
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No active orders found for Webhorse Studio',
        partner: partner,
        allOrders: orders
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
