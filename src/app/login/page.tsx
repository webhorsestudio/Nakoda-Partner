"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { generateOTP, sendOTP, validateMobileNumber, verifyOTP } from "@/services/otpService";
import MobileForm from "@/components/auth/MobileForm";
import OtpForm from "@/components/auth/OtpForm";
import AuthAlert from "@/components/auth/AuthAlert";
import LoadingSkeleton from "@/components/auth/LoadingSkeleton";

export default function LoginPage() {
  const router = useRouter();
  const { isClient } = useAuth();
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate mobile number format
    if (!validateMobileNumber(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      setIsLoading(false);
      return;
    }

    try {
      // Generate OTP
      const otpValue = generateOTP();
      
      // Store mobile number first
      sessionStorage.setItem('mobile', mobileNumber);

      // Send OTP via Fast2SMS API
      const result = await sendOTP(mobileNumber, otpValue);
      
      if (result.success) {
        setSuccess('OTP sent successfully! Check your mobile for SMS.');
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
      if (verifyOTP(otp, storedOtp)) {
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

  const handleBackToMobile = () => {
    setStep('mobile');
    setError('');
    setSuccess('');
  };

  // Show loading state during hydration
  if (!isClient) {
    return <LoadingSkeleton />;
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

        <AuthAlert error={error} success={success} />

        {step === 'mobile' ? (
          <MobileForm
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            onSubmit={handleMobileSubmit}
            isLoading={isLoading}
            error={error}
            success={success}
          />
        ) : (
          <OtpForm
            otp={otp}
            setOtp={setOtp}
            onSubmit={handleOtpSubmit}
            onBack={handleBackToMobile}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
