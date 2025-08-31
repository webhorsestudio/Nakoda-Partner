import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const mobile = searchParams.get('mobile');
    const table = searchParams.get('table');

    if (!email && !mobile) {
      return NextResponse.json({
        success: false,
        error: 'Either email or mobile parameter is required'
      }, { status: 400 });
    }

    if (!table || !['admin_users', 'partners'].includes(table)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid table parameter. Must be admin_users or partners'
      }, { status: 400 });
    }

    let userData = null;

    if (table === 'admin_users') {
      // Check admin_users table
      const query = supabase
        .from('admin_users')
        .select('id, name, email, phone, role, status, access_level, permissions, avatar, created_at, updated_at');
      
      // Use email or mobile based on what's provided
      if (email) {
        query.eq('email', email);
      } else if (mobile) {
        query.eq('phone', mobile);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching from admin_users:', error);
        return NextResponse.json({
          success: false,
          error: 'Database error'
        }, { status: 500 });
      }

      if (data && data.length > 0) {
        // If multiple users exist, select the first one (should be rare)
        const user = data[0];
        if (data.length > 1) {
          console.log(`⚠️ Found ${data.length} admin users with same ${email ? 'email' : 'mobile'}, using first one: ${user.name}`);
        }
        
        userData = {
          ...user,
          user_role: user.role || 'admin', // Map existing role to user_role
          source_table: 'admin_users'
        };
      }
    } else if (table === 'partners') {
      // Check partners table
      const query = supabase
        .from('partners')
        .select('id, name, email, mobile, status, service_type, rating, total_orders, total_revenue, created_at, updated_at');
      
      // Use email or mobile based on what's provided
      if (email) {
        query.eq('email', email);
      } else if (mobile) {
        query.eq('mobile', mobile);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching from partners:', error);
        return NextResponse.json({
          success: false,
          error: 'Database error'
        }, { status: 500 });
      }

      if (data && data.length > 0) {
        // If multiple partners exist, select the best one (prioritize active > pending > others)
        let selectedPartner = data[0];
        if (data.length > 1) {
          console.log(`⚠️ Found ${data.length} partners with same ${email ? 'email' : 'mobile'}, selecting best one...`);
          
          const activePartner = data.find(p => p.status === 'Active' || p.status === 'active');
          const pendingPartner = data.find(p => p.status === 'Pending' || p.status === 'pending');
          selectedPartner = activePartner || pendingPartner || data[0];
          console.log(`✅ Selected partner ID ${selectedPartner.id} with status: ${selectedPartner.status}`);
        }
        
        userData = {
          ...selectedPartner,
          user_role: 'partner',
          source_table: 'partners',
          phone: selectedPartner.mobile // Map mobile to phone for consistency
        };
      }
    }

    if (userData) {
      return NextResponse.json({
        success: true,
        data: userData
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        data: null
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Error in check-role API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
