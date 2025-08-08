"use client";

import { useState } from "react";
import { PhoneIcon } from "@heroicons/react/24/outline";

interface MobileFormProps {
  mobileNumber: string;
  setMobileNumber: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: string;
  success: string;
}

export default function MobileForm({
  mobileNumber,
  setMobileNumber,
  onSubmit,
  isLoading,
  error,
  success
}: MobileFormProps) {
  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
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
    </form>
  );
}
