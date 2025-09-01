import React from 'react';
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wallet } from './index';
import Image from 'next/image';

interface PartnerHeaderProps {
  coins?: number;
  onMenuClick: () => void;
}

export default function PartnerHeader({ 
  coins = 0,
  onMenuClick 
}: PartnerHeaderProps) {
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onMenuClick();
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Nakoda Logo */}
          <div className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Nakoda Urban Services"
              width={140}
              height={45}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Wallet with Coins */}
            <Wallet coins={coins} />
            
            {/* Menu Button - Visible on all screen sizes for accessibility */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              onKeyDown={handleKeyDown}
              className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Open menu (Press Escape to close)"
              title="Open menu (Press Escape to close)"
            >
              <MenuIcon className="h-5 w-5 text-slate-600" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
