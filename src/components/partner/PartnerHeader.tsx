import React from 'react';
import { MenuIcon } from "lucide-react";
import Image from 'next/image';

interface PartnerHeaderProps {
  onMenuClick: () => void;
}

export default function PartnerHeader({ 
  onMenuClick 
}: PartnerHeaderProps) {
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onMenuClick();
    }
  };

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Nakoda Logo */}
          <div className="flex items-center flex-1 min-w-0">
            <Image
              src="/images/logo.png"
              alt="Nakoda Urban Services"
              width={140}
              height={45}
              className="h-10 w-auto object-contain sm:h-11"
              priority
            />
          </div>
          
          {/* Right side - Menu Button */}
          <div className="flex-shrink-0">
            <button
              onClick={onMenuClick}
              onKeyDown={handleKeyDown}
              className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label="Open menu (Press Escape to close)"
              title="Open menu (Press Escape to close)"
            >
              <MenuIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
