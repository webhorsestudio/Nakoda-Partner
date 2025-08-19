"use client";

import { useState } from "react";
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { CheckIcon, LoadingSpinner } from "./icons";

interface OtpFormProps {
  mobile: string;
  onSubmit: (otp: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

export default function OtpForm({ mobile, onSubmit, onBack, loading }: OtpFormProps) {
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      return;
    }

    await onSubmit(otp.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mobile number display */}
      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
        <p className="text-sm text-slate-600 mb-1">OTP sent to</p>
        <p className="text-lg font-semibold text-slate-800">{mobile}</p>
      </div>

      <div className="space-y-3">
        <label htmlFor="otp" className="block text-sm font-semibold text-slate-700 mb-2">
          Verification Code <span className="text-red-500 font-bold">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <LockClosedIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
          </div>
          <input
            id="otp"
            type={showOtp ? "text" : "password"}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="block w-full pl-12 pr-16 py-4 rounded-2xl border-2 border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all duration-300 text-center text-xl font-mono tracking-widest text-slate-700 placeholder-slate-400"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            disabled={loading}
          />
          {/* Input focus indicator */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent pointer-events-none transition-all duration-300 group-focus-within:border-indigo-500/50"></div>
          
          {/* Toggle password visibility */}
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <button
              type="button"
              onClick={() => setShowOtp(!showOtp)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors duration-200 rounded-lg hover:bg-slate-100"
            >
              {showOtp ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
          <span>Enter the 6-digit verification code sent to your mobile</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-500/20 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
        <button
          type="submit"
          disabled={loading || !otp.trim()}
          className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-400 py-4 px-6 rounded-2xl text-white font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-3">
              <LoadingSpinner />
              <span>Verifying...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Verify OTP</span>
              <CheckIcon />
            </div>
          )}
        </button>
      </div>

      {/* Additional info */}
      <div className="text-center pt-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          Didn&apos;t receive the code?{" "}
          <span className="text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">Resend OTP</span>
        </p>
      </div>
    </form>
  );
}
