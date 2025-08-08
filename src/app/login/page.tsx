"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PhoneIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fast2SMS API Configuration
  const FAST2SMS_API_KEY = "CYZAqVtcxfOL8RNWkSK6EmJ5ov9Pped7wGXQUIbasFuyhrj3B4YPHwGOT9NFSLht0kDyfrq82QACjloI";
  const FAST2SMS_SENDER_ID = "NuServ";
  const FAST2SMS_MESSAGE_ID = "160562";

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    const authToken = document.cookie.includes('auth-token');
    if (authToken) {
      router.push('/admin');
    }
  }, [router]);

  // Generate a random 4-digit OTP
  const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const sendOTP = async (mobile: string, otpValue: string) => {
    try {
      console.log('Sending OTP to:', mobile);
      
      // For development/demo purposes, always use test endpoint
      const response = await fetch('/api/test-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mobile: mobile
        })
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success) {
        // Store the OTP returned from server
        if (data.otp) {
          sessionStorage.setItem('otp', data.otp);
          console.log('OTP stored:', data.otp);
          
          // Show OTP in alert for easy access
          alert(`🔐 Your OTP is: ${data.otp}\n\nThis is a demo OTP. In production, this would be sent via SMS.`);
        }
        return { success: true, message: data.message };
      } else {
        console.log('API failed:', data.message);
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

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate mobile number format (Indian mobile number)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      setIsLoading(false);
      return;
    }

    try {
      // Generate OTP
      const otpValue = generateOTP();
      
      // Store OTP in sessionStorage for verification (in production, this should be server-side)
      sessionStorage.setItem('otp', otpValue);
      sessionStorage.setItem('mobile', mobileNumber);

      // Send OTP via Fast2SMS API
      const result = await sendOTP(mobileNumber, otpValue);
      
      if (result.success) {
        setSuccess('OTP sent successfully to your mobile number');
        setStep('otp');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Get stored OTP and mobile number
      const storedOtp = sessionStorage.getItem('otp');
      const storedMobile = sessionStorage.getItem('mobile');

      if (!storedOtp || !storedMobile) {
        setError('OTP session expired. Please request a new OTP.');
        setStep('mobile');
        setIsLoading(false);
        return;
      }

      // Verify OTP
      if (otp === storedOtp) {
        // Clear session storage
        sessionStorage.removeItem('otp');
        sessionStorage.removeItem('mobile');
        
        // Set authentication cookie
        document.cookie = 'auth-token=authenticated; path=/; max-age=86400'; // 24 hours
        router.push('/admin');
      } else {
        setError('Invalid OTP. Please check and try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 'mobile' ? 'Sign in to your account' : 'Enter OTP'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'mobile' 
              ? 'Enter your mobile number to receive OTP' 
              : 'Enter the 4-digit OTP sent to your mobile'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {step === 'mobile' ? (
          <form className="mt-8 space-y-6" onSubmit={handleMobileSubmit}>
            <div>
              <label htmlFor="mobile" className="sr-only">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  maxLength={10}
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                suppressHydrationWarning
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending OTP...
                  </div>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>

            <div className="text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  🧪 Demo Mode - Testing Environment
                </p>
                <p className="text-xs text-blue-700 mb-2">
                  Mobile: <span className="font-mono bg-blue-100 px-1 rounded">7506873720</span>
                </p>
                <p className="text-xs text-blue-700">
                  OTP: <span className="font-mono bg-blue-100 px-1 rounded">7506</span>
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  💡 Demo OTP will be shown in alert popup. Real SMS requires production deployment.
                </p>
              </div>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
            <div>
              <label htmlFor="otp" className="sr-only">
                OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="otp"
                  name="otp"
                  type={showOtp ? "text" : "password"}
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowOtp(!showOtp)}
                  suppressHydrationWarning
                >
                  {showOtp ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('mobile')}
                className="text-sm text-blue-600 hover:text-blue-500"
                suppressHydrationWarning
              >
                ← Back to mobile number
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                suppressHydrationWarning
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
