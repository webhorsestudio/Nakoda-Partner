"use client";

import { useState } from "react";
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface OtpFormProps {
  otp: string;
  setOtp: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

export default function OtpForm({
  otp,
  setOtp,
  onSubmit,
  onBack,
  isLoading
}: OtpFormProps) {
  const [showOtp, setShowOtp] = useState(false);

  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
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
          onClick={onBack}
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
  );
}
