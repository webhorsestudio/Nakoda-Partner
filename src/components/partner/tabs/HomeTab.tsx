import React from 'react';
import { MapPinIcon } from "lucide-react";
import { PromotionalBanner, JobListings, ErrorBoundary, Wallet } from '../index';
import { usePartnerAcceptedOrders } from '@/hooks/usePartnerAcceptedOrders';

interface HomeTabProps {
  totalOrders?: number;
  onPromoButtonClick: () => void;
  partnerName?: string;
  location?: string;
  coins?: number;
  walletBalance?: number;
  onTabChange?: (tabId: string) => void;
}

export default function HomeTab({ 
  totalOrders, 
  onPromoButtonClick, 
  partnerName = 'Partner',
  location = 'Location not specified',
  coins = 0,
  walletBalance = 0,
  onTabChange
}: HomeTabProps) {
  // Get the actual count of ongoing tasks
  const { total: ongoingTasksCount } = usePartnerAcceptedOrders();

  return (
    <>
      {/* Partner Info Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-3">
            <h1 className="text-lg font-bold text-gray-900 leading-tight truncate mb-1">
              {partnerName}
            </h1>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPinIcon className="h-4 w-4 mr-1.5 flex-shrink-0 text-gray-500" />
              <span className="truncate">{location}</span>
            </div>
          </div>
          
          {/* Wallet */}
          <div className="flex-shrink-0">
            <Wallet coins={coins} walletBalance={walletBalance} />
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="h-px bg-gray-100 mb-4" />

      {/* Promotional Banner */}
      <ErrorBoundary>
        <PromotionalBanner onButtonClick={onPromoButtonClick} />
      </ErrorBoundary>

      {/* Job Listings */}
      <ErrorBoundary>
        <JobListings
          totalOrders={ongoingTasksCount}
          onViewAllJobs={() => onTabChange?.('ongoing')}
        />
      </ErrorBoundary>
    </>
  );
}
