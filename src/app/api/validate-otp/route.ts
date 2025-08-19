import { NextRequest, NextResponse } from 'next/server';
import { validateOTP, debugOTPStore, cleanMobileNumber } from '@/services/otpService';
import { supabase } from '@/lib/supabase';
import { generateJWTToken } from '@/utils/authUtils';

export async function POST(request: NextRequest) {
  try {
    const { mobile, otp } = await request.json();

    // Input validation
    if (!mobile || !otp) {
      return NextResponse.json(
        { success: false, message: 'Mobile number and OTP are required' },
        { status: 400 }
      );
    }

    // Debug: Check OTP store state before validation
    console.log('=== VALIDATE-OTP API DEBUG ===');
    console.log('Original mobile:', mobile);
    console.log('OTP:', otp);
    
    // Clean mobile number for consistent database lookup
    const cleanedMobile = cleanMobileNumber(mobile);
    console.log('Cleaned mobile for DB lookup:', cleanedMobile);
    
    debugOTPStore();
    console.log('================================');

    // Validate OTP server-side
    const otpValidation = await validateOTP(cleanedMobile, otp);

    if (!otpValidation.success) {
      return NextResponse.json(
        { success: false, message: otpValidation.message },
        { status: 400 }
      );
    }

    // OTP is valid, now get user details (check both admin_users and partners)
    try {
      console.log('=== USER LOOKUP DEBUG ===');
      console.log('Looking for user with cleaned mobile:', cleanedMobile);
      
      // First check admin_users table
      console.log('Checking admin_users table...');
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("id, name, email, phone, role, status, access_level, permissions")
        .eq("phone", cleanedMobile)
        .single();

      console.log('Admin lookup result:', { adminUser, adminError });

      let userData = null;
      let userType = '';

      if (adminUser && adminUser.status === 'Active') {
        // Admin user found
        userData = adminUser;
        userType = 'admin';
        console.log('✅ Admin user found:', adminUser.name);
      } else {
        // Check partners table
        console.log('Checking partners table...');
        const { data: partnerUser, error: partnerError } = await supabase
          .from("partners")
          .select("id, name, email, mobile, status, service_type")
          .eq("mobile", cleanedMobile)
          .single();

        console.log('Partner lookup result:', { partnerUser, partnerError });

        if (partnerUser) {
          console.log('✅ Partner user found:', partnerUser.name);
          console.log('Partner status:', partnerUser.status);
          
          // Check if partner can login (active or pending status)
          if (partnerUser.status === 'active' || partnerUser.status === 'pending') {
            userData = partnerUser;
            userType = 'partner';
            console.log('✅ Partner login allowed with status:', partnerUser.status);
          } else {
            console.log('❌ Partner status not allowed for login:', partnerUser.status);
            return NextResponse.json(
              { success: false, message: 'Partner account is deactivated. Please contact administrator.' },
              { status: 403 }
            );
          }
        } else {
          // Try alternative mobile number formats
          console.log('❌ No partner found with cleaned mobile, trying alternative formats...');
          
          // Try with +91 prefix
          const { data: partnerWithPrefix, error: prefixError } = await supabase
            .from("partners")
            .select("id, name, email, mobile, status, service_type")
            .eq("mobile", `+91 ${cleanedMobile}`)
            .single();
          
          console.log('Partner lookup with +91 prefix:', { partnerWithPrefix, prefixError });
          
          if (partnerWithPrefix) {
            console.log('✅ Partner found with +91 prefix:', partnerWithPrefix.name);
            if (partnerWithPrefix.status === 'active' || partnerWithPrefix.status === 'pending') {
              userData = partnerWithPrefix;
              userType = 'partner';
              console.log('✅ Partner login allowed with +91 prefix');
            } else {
              console.log('❌ Partner with +91 prefix has invalid status:', partnerWithPrefix.status);
              return NextResponse.json(
                { success: false, message: 'Partner account is deactivated. Please contact administrator.' },
                { status: 403 }
              );
            }
          } else {
            // Try with LIKE search as last resort
            console.log('❌ No partner found with +91 prefix, trying LIKE search...');
            
            const { data: partnerLike, error: likeError } = await supabase
              .from("partners")
              .select("id, name, email, mobile, status, service_type")
              .like("mobile", `%${cleanedMobile}%`)
              .single();
            
            console.log('Partner lookup with LIKE search:', { partnerLike, likeError });
            
            if (partnerLike) {
              console.log('✅ Partner found with LIKE search:', partnerLike.name);
              if (partnerLike.status === 'active' || partnerLike.status === 'pending') {
                userData = partnerLike;
                userType = 'partner';
                console.log('✅ Partner login allowed with LIKE search');
              } else {
                console.log('❌ Partner with LIKE search has invalid status:', partnerLike.status);
                return NextResponse.json(
                  { success: false, message: 'Partner account is deactivated. Please contact administrator.' },
                  { status: 403 }
                );
              }
            } else {
              console.log('❌ No partner found with any mobile format');
              return NextResponse.json(
                { success: false, message: 'Mobile number not registered. Please check and try again.' },
                { status: 403 }
              );
            }
          }
        }
      }

      if (!userData) {
        console.log('❌ No user data found after all lookup attempts');
        return NextResponse.json(
          { success: false, message: 'User not found. Please check your mobile number or contact administrator.' },
          { status: 403 }
        );
      }

      // Generate JWT token
      const token = generateJWTToken({
        userId: userData.id,
        email: userData.email,
        phone: userType === 'admin' ? (userData as { phone: string }).phone : (userData as { mobile: string }).mobile,
        role: userType
      });

      console.log('=== JWT TOKEN DEBUG ===');
      console.log('Token generated:', token ? 'Yes' : 'No');
      console.log('Token length:', token?.length || 0);
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
      console.log('User type:', userType);
      console.log('========================');

      // Update last login time based on user type
      if (userType === 'admin') {
        await supabase
          .from("admin_users")
          .update({ last_login: new Date().toISOString() })
          .eq("id", userData.id);
      } else if (userType === 'partner') {
        await supabase
          .from("partners")
          .update({ last_active: new Date().toISOString() })
          .eq("id", userData.id);
      }

      // Return success with token
      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userType === 'admin' ? (userData as { phone: string }).phone : (userData as { mobile: string }).mobile,
          role: userType
        },
        token: token
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, message: 'Failed to retrieve user information' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in validate-otp API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
