"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import { setWebViewPersistentSession } from "@/utils/authUtils";
import { backupSessionToFlutter } from "@/utils/webViewUtils";

// Utility function to safely handle string operations
const safeTrim = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
};

const isValidString = (value: unknown): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
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

      // Ensure mobileNumber is a valid string
      const cleanMobile = safeTrim(mobileNumber);
      if (!isValidString(cleanMobile)) {
        throw new Error("Please enter a valid mobile number");
      }

      // First try to validate as admin
      let userType = 'unknown';
      let userData = null;

      try {
        userData = await validateUser(cleanMobile, 'admin');
        userType = 'admin';
      } catch (adminError) {
        // If not admin, try to validate as partner
        try {
          userData = await validateUser(cleanMobile, 'partner');
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
        body: JSON.stringify({ mobile: cleanMobile }),
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

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure mobile is a valid string
    if (!isValidString(mobile)) {
      setError("Please enter a valid mobile number");
      return;
    }
    
    await sendOTP(safeTrim(mobile));
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure otp is a valid string
    if (!isValidString(otp)) {
      setError("Please enter a valid OTP");
      return;
    }
    
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
          mobile: safeTrim(mobile), 
          otp: safeTrim(otp) 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP validation failed");
      }

      if (data.success) {
        // Store JWT token securely in both localStorage and cookie
        localStorage.setItem("auth-token", data.token);
        
        // Set persistent session cookie for better browser session management
        setWebViewPersistentSession(data.token);
        
        // Also backup to Flutter if available
        backupSessionToFlutter(data.token);
        
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="space-y-2">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image 
              src="/images/logo.png" 
              alt="Nakoda Urban Services" 
              width={48}
              height={48}
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {step === "mobile" ? "Welcome Back" : "Verify Your Phone"}
          </h1>
          <p className="text-slate-600 text-sm">
            {step === "mobile" 
              ? "Enter your mobile number to get started" 
              : `We've sent a verification code to ${mobile}`
            }
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Mobile Form */}
            {step === "mobile" ? (
              <form onSubmit={handleMobileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="mobile" className="text-sm font-medium text-slate-700">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Enter your mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(String(e.target.value || ''))}
                      className="pl-10 h-11"
                      maxLength={10}
                      disabled={loading}
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Enter your registered mobile number
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                  disabled={loading || !isValidString(mobile)}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </form>
            ) : (
              /* OTP Form */
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                {/* Mobile Display */}
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-slate-600 mb-1">OTP sent to</p>
                  <p className="text-sm font-semibold text-slate-800">{mobile}</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium text-slate-700">
                    Verification Code
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="otp"
                      type={showOtp ? "text" : "password"}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(String(e.target.value || ''))}
                      className="pl-10 pr-10 h-11 text-center text-lg font-mono tracking-widest"
                      maxLength={6}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOtp(!showOtp)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showOtp ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Enter the 6-digit code sent to your mobile
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToMobile}
                    disabled={loading}
                    className="flex-1 h-11"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
                    disabled={loading || !isValidString(otp)}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    Didn&apos;t receive the code?{" "}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => {
                        setStep("mobile");
                        setOtp("");
                        setError("");
                        setSuccess("");
                      }}
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            By continuing, you agree to our{" "}
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">Terms of Service</span>
            {" "}and{" "}
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
