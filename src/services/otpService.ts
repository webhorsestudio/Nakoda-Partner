// Generate a random 4-digit OTP
export const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP via API
export const sendOTP = async (mobile: string, otpValue: string) => {
  try {
    // Call our server-side API route for SMS delivery
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mobile: mobile,
        otp: otpValue
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Store the OTP returned from server
      if (data.otp) {
        sessionStorage.setItem('otp', data.otp);
      }
      return { success: true, message: data.message };
    } else {
      console.error('API failed:', data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { 
      success: false, 
      message: "Network error. Please check your internet connection." 
    };
  }
};

// Validate mobile number format (Indian mobile number)
export const validateMobileNumber = (mobile: string) => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

// Verify OTP
export const verifyOTP = (enteredOtp: string, storedOtp: string) => {
  if (enteredOtp === storedOtp) {
    return true;
  } else {
    return false;
  }
};
