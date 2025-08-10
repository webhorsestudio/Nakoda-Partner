"use client";

import { useState } from "react";
import { PhoneIcon } from "@heroicons/react/24/outline";

interface MobileFormProps {
  onSubmit: (mobile: string) => Promise<void>;
  loading: boolean;
}

export default function MobileForm({ onSubmit, loading }: MobileFormProps) {
  const [mobile, setMobile] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobile.trim()) {
      return;
    }

    await onSubmit(mobile.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label htmlFor="mobile" className="block text-sm font-semibold text-slate-700 mb-2">
          Mobile Number <span className="text-red-500 font-bold">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <PhoneIcon className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200" />
          </div>
          <input
            id="mobile"
            type="tel"
            required
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all duration-300 text-slate-700 placeholder-slate-400 font-medium"
            placeholder="Enter your mobile number"
            maxLength={10}
            disabled={loading}
          />
          {/* Input focus indicator */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent pointer-events-none transition-all duration-300 group-focus-within:border-blue-500/50"></div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
          <span>Enter your registered mobile number to receive OTP</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !mobile.trim()}
        className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-400 py-4 px-6 rounded-2xl text-white font-semibold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Sending OTP...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span>Send OTP</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        )}
      </button>

      {/* Additional info */}
      <div className="text-center pt-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          By continuing, you agree to our{" "}
          <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">Terms of Service</span>
          {" "}and{" "}
          <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">Privacy Policy</span>
        </p>
      </div>
    </form>
  );
}
