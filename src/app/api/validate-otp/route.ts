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
      console.log('OTP validation failed:', otpValidation.message);
      
      // Provide more specific error messages based on the failure reason
      let errorMessage = otpValidation.message;
      let statusCode = 400;
      
      if (otpValidation.message.includes('expired') || otpValidation.message.includes('not found')) {
        errorMessage = 'OTP has expired or was not found. Please request a new OTP.';
        statusCode = 400;
      } else if (otpValidation.message.includes('Maximum OTP attempts exceeded')) {
        errorMessage = 'Too many failed attempts. Please request a new OTP.';
        statusCode = 429;
      } else if (otpValidation.message.includes('Invalid OTP')) {
        errorMessage = otpValidation.message; // Keep the attempts remaining message
        statusCode = 400;
      }
      
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: statusCode }
      );
    }

    console.log('✅ OTP validation successful');

    // OTP is valid, now get user details (check both admin_users and partners)
    try {
      console.log('=== USER LOOKUP DEBUG ===');
      console.log('Looking for user with cleaned mobile:', cleanedMobile);
      
      // First check admin_users table
      console.log('Checking admin_users table...');
      const { data: adminUsers, error: adminError } = await supabase
        .from("admin_users")
        .select("id, name, email, phone, role, status, access_level, permissions")
        .eq("phone", cleanedMobile);

      console.log('Admin lookup result:', { adminUsers, adminError });

      let userData = null;
      let userType = '';

      // Check if admin user exists and is active
      if (adminUsers && adminUsers.length > 0) {
        const adminUser = adminUsers[0]; // Take the first admin user if multiple exist
        if (adminUser.status === 'Active') {
          // Admin user found
          userData = adminUser;
          userType = 'admin';
          console.log('✅ Admin user found:', adminUser.name);
        } else {
          console.log('❌ Admin user found but status is not Active:', adminUser.status);
        }
      } else {
        console.log('No admin user found with this mobile number');
      }

      // If no admin user found, check partners table
      if (!userData) {
        console.log('Checking partners table...');
        const { data: partnerUsers, error: partnerError } = await supabase
          .from("partners")
          .select("id, name, email, mobile, status, service_type")
          .eq("mobile", cleanedMobile);

        console.log('Partner lookup result:', { partnerUsers, partnerError });

        if (partnerUsers && partnerUsers.length > 0) {
          // If multiple partners exist, select the best one (prioritize active > pending > others)
          let selectedPartner = partnerUsers[0];
          
          if (partnerUsers.length > 1) {
            console.log(`Found ${partnerUsers.length} partners with same mobile, selecting best one...`);
            
            // Prioritize: Active > Pending > Others, then most recent
            const activePartner = partnerUsers.find(p => p.status === 'Active' || p.status === 'active');
            const pendingPartner = partnerUsers.find(p => p.status === 'Pending' || p.status === 'pending');
            
            selectedPartner = activePartner || pendingPartner || partnerUsers[0];
            console.log(`Selected partner ID ${selectedPartner.id} with status: ${selectedPartner.status}`);
          }

          console.log('✅ Partner user found:', selectedPartner.name);
          console.log('Partner status:', selectedPartner.status);
          
          // Check if partner can login (active or pending status)
          if (selectedPartner.status === 'Active' || selectedPartner.status === 'active' || 
              selectedPartner.status === 'Pending' || selectedPartner.status === 'pending') {
            userData = selectedPartner;
            userType = 'partner';
            console.log('✅ Partner login allowed with status:', selectedPartner.status);
          } else {
            console.log('❌ Partner status not allowed for login:', selectedPartner.status);
            return NextResponse.json(
              { success: false, message: 'Partner account is deactivated. Please contact administrator.' },
              { status: 403 }
            );
          }
        } else {
          // Try alternative mobile number formats
          console.log('❌ No partner found with cleaned mobile, trying alternative formats...');
          
          // Try with +91 prefix
          const { data: partnersWithPrefix, error: prefixError } = await supabase
            .from("partners")
            .select("id, name, email, mobile, status, service_type")
            .eq("mobile", `+91 ${cleanedMobile}`);
          
          console.log('Partner lookup with +91 prefix:', { partnersWithPrefix, prefixError });
          
          if (partnersWithPrefix && partnersWithPrefix.length > 0) {
            const partnerWithPrefix = partnersWithPrefix[0]; // Take first if multiple exist
            console.log('✅ Partner found with +91 prefix:', partnerWithPrefix.name);
            if (partnerWithPrefix.status === 'Active' || partnerWithPrefix.status === 'active' ||
                partnerWithPrefix.status === 'Pending' || partnerWithPrefix.status === 'pending') {
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
            
            const { data: partnersLike, error: likeError } = await supabase
              .from("partners")
              .select("id, name, email, mobile, status, service_type")
              .like("mobile", `%${cleanedMobile}%`);
            
            console.log('Partner lookup with LIKE search:', { partnersLike, likeError });
            
            if (partnersLike && partnersLike.length > 0) {
              const partnerLike = partnersLike[0]; // Take first if multiple exist
              console.log('✅ Partner found with LIKE search:', partnerLike.name);
              if (partnerLike.status === 'Active' || partnerLike.status === 'active' ||
                  partnerLike.status === 'Pending' || partnerLike.status === 'pending') {
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
