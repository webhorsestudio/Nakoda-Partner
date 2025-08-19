import React, { Suspense } from 'react';
import { PartnerHeader, PartnerSidebar, PromotionalBanner, BottomNavigation, JobListings, ErrorBoundary } from './index';

interface PartnerDashboardContentProps {
  partnerName?: string;
  location?: string;
  sidebarOpen: boolean;
  activeTab: string;
  coins?: number;
  totalOrders?: number;
  onToggleSidebar: () => void;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
  onPromoButtonClick: () => void;
}

export default function PartnerDashboardContent({
  partnerName,
  location,
  sidebarOpen,
  activeTab,
  coins,
  totalOrders,
  onToggleSidebar,
  onTabChange,
  onLogout,
  onPromoButtonClick
}: PartnerDashboardContentProps) {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <ErrorBoundary>
        <Suspense fallback={<div className="h-16 bg-slate-100 animate-pulse" />}>
          <PartnerHeader
            partnerName={partnerName}
            location={location}
            coins={coins}
            onMenuClick={onToggleSidebar}
          />
        </Suspense>
      </ErrorBoundary>

      {/* Sidebar */}
      <ErrorBoundary>
        <PartnerSidebar
          isOpen={sidebarOpen}
          onClose={onToggleSidebar}
          onLogout={onLogout}
        />
      </ErrorBoundary>

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Promotional Banner */}
        <ErrorBoundary>
          <Suspense fallback={<div className="h-24 bg-slate-100 animate-pulse rounded-lg" />}>
            <PromotionalBanner onButtonClick={onPromoButtonClick} />
          </Suspense>
        </ErrorBoundary>

        {/* Job Listings */}
        <ErrorBoundary>
          <JobListings
            totalOrders={totalOrders}
            onViewAllJobs={() => console.log('View all jobs clicked')}
          />
        </ErrorBoundary>
      </div>

      {/* Bottom Navigation */}
      <ErrorBoundary>
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      </ErrorBoundary>
    </div>
  );
}
