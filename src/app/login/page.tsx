"use client";

import { useState, useEffect } from "react";
import { MobileForm, OtpForm, AuthAlert, LoadingSkeleton, ErrorBoundary } from "@/components/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const validateUser = async (mobileNumber: string, userType: 'admin' | 'partner') => {
    try {
      const endpoint = userType === 'admin' ? "/api/validate-admin" : "/api/validate-partner";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile: mobileNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Mobile number not registered. Please check and try again.");
        } else if (response.status === 403) {
          const message = userType === 'admin' 
            ? "Access denied. This mobile number is not registered as an admin user. Please contact your system administrator."
            : "Access denied. This partner account is deactivated. Please contact your system administrator.";
          throw new Error(message);
        } else {
          throw new Error(data.error || `Failed to validate ${userType} user`);
        }
      }

      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const sendOTP = async (mobileNumber: string) => {
    try {
      setLoading(true);
      setError("");

      // First try to validate as admin
      let userType = 'unknown';
      let userData = null;

      try {
        userData = await validateUser(mobileNumber, 'admin');
        userType = 'admin';
      } catch (adminError) {
        // If not admin, try to validate as partner
        try {
          userData = await validateUser(mobileNumber, 'partner');
          userType = 'partner';
        } catch (partnerError) {
          // If neither admin nor partner, show error
          throw new Error("Mobile number not registered as admin or partner. Please check and try again.");
        }
      }

      // If validation passes, send OTP
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile: mobileNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(data.message || "Too many OTP requests. Please wait before requesting another.");
        } else {
          throw new Error(data.message || "Failed to send OTP");
        }
      }

      setSuccess(`OTP sent successfully to ${userData.name} (${userType === 'admin' ? 'Admin' : 'Partner'})`);
      setStep("otp");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleMobileSubmit = async (mobileNumber: string) => {
    setMobile(mobileNumber);
    await sendOTP(mobileNumber);
  };

  const handleOtpSubmit = async (otpValue: string) => {
    try {
      setLoading(true);
      setError("");

      // Validate OTP server-side
      const response = await fetch("/api/validate-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          mobile: mobile, 
          otp: otpValue 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP validation failed");
      }

      if (data.success) {
        // Store JWT token securely in both localStorage and cookie
        localStorage.setItem("auth-token", data.token);
        
        // Also set as cookie for middleware access
        document.cookie = `auth-token=${data.token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
        
        setSuccess("Login successful! Redirecting...");
        
        // Check user role and redirect accordingly
        setTimeout(() => {
          if (data.user && data.user.role === 'partner') {
            router.push("/partner");
          } else {
            router.push("/admin");
          }
        }, 1000);
      } else {
        throw new Error(data.message || "Authentication failed");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMobile = () => {
    setStep("mobile");
    setError("");
    setSuccess("");
  };

  if (!isClient) {
    return <LoadingSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {/* Logo and Brand Section */}
            <div className="text-center mb-10 animate-fade-in-up">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3">
                Nakoda Partner
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Login Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {/* Card Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {step === "mobile" ? "Welcome Back" : "Verify OTP"}
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  {step === "mobile" 
                    ? "Enter your mobile number to login" 
                    : `We've sent a verification code to ${mobile}`
                  }
                </p>
              </div>

              {/* Error/Success Messages */}
              <div className="mb-6 space-y-3">
                {error && <AuthAlert type="error" message={error} />}
                {success && <AuthAlert type="success" message={success} />}
              </div>

              {/* Forms */}
              <div className="animate-slide-in-right">
                {step === "mobile" ? (
                  <MobileForm
                    onSubmit={handleMobileSubmit}
                    loading={loading}
                  />
                ) : (
                  <OtpForm
                    mobile={mobile}
                    onSubmit={handleOtpSubmit}
                    onBack={handleBackToMobile}
                    loading={loading}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
