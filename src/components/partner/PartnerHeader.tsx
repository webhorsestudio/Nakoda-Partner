import React from 'react';
import { MapPinIcon, MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wallet } from './index';

interface PartnerHeaderProps {
  partnerName?: string;
  location?: string;
  coins?: number;
  onMenuClick: () => void;
}

export default function PartnerHeader({ 
  partnerName = 'Webhorse Studio', 
  location = 'Andheri West, Mumbai',
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
          {/* Left side - Partner Info */}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-slate-900 leading-tight truncate">
              {partnerName}
            </h1>
            <div className="flex items-center text-slate-600 text-sm">
              <MapPinIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
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
