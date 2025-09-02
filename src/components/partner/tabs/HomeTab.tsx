import React from 'react';
import { MapPinIcon, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { PromotionalBanner, JobListings, ErrorBoundary } from '../index';

interface HomeTabProps {
  totalOrders?: number;
  onPromoButtonClick: () => void;
  partnerName?: string;
  location?: string;
}

export default function HomeTab({ 
  totalOrders, 
  onPromoButtonClick, 
  partnerName = 'Partner',
  location = 'Location not specified'
}: HomeTabProps) {
  const router = useRouter();

  const handleCalendarClick = () => {
    router.push('/partner/calendar');
  };

  return (
    <>
      {/* Partner Info Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-slate-900 leading-tight truncate mb-2">
              {partnerName}
            </h1>
            <div className="flex items-center text-slate-600 text-sm">
              <MapPinIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>
          
          {/* Calendar Button */}
          <div className="flex-shrink-0 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCalendarClick}
              className="h-10 w-10 hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Open calendar view"
              title="View Calendar"
            >
              <CalendarIcon className="h-5 w-5 text-slate-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="h-px bg-slate-200 mb-4" />

      {/* Promotional Banner */}
      <ErrorBoundary>
        <PromotionalBanner onButtonClick={onPromoButtonClick} />
      </ErrorBoundary>

      {/* Job Listings */}
      <ErrorBoundary>
        <JobListings
          totalOrders={totalOrders}
          onViewAllJobs={() => console.log('View all jobs clicked')}
        />
      </ErrorBoundary>
    </>
  );
}
