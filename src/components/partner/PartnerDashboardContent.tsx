import React, { Suspense } from 'react';
import { PartnerHeader, PartnerSidebar, BottomNavigation, ErrorBoundary } from './index';
import HomeTab from './tabs/HomeTab';
import NewTaskTab from './tabs/NewTaskTab';
import OngoingTab from './tabs/OngoingTab';
import ReportingTab from './tabs/ReportingTab';
import RevenueTab from './tabs/RevenueTab';

interface PartnerDashboardContentProps {
  partnerName?: string;
  location?: string;
  sidebarOpen: boolean;
  activeTab: string;
  coins?: number;
  walletBalance?: number;
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
  walletBalance,
  totalOrders,
  onToggleSidebar,
  onTabChange,
  onLogout,
  onPromoButtonClick
}: PartnerDashboardContentProps) {
  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab 
            totalOrders={totalOrders} 
            onPromoButtonClick={onPromoButtonClick}
            partnerName={partnerName}
            location={location}
            coins={coins}
            walletBalance={walletBalance}
            onTabChange={onTabChange}
          />
        );
      
      case 'new-task':
        return <NewTaskTab />;
      
      case 'ongoing':
        return <OngoingTab />;
      
      case 'reporting':
        return <ReportingTab />;
      
      case 'revenue':
        return <RevenueTab coins={coins} />;
      
      default:
        return (
          <HomeTab 
            totalOrders={totalOrders} 
            onPromoButtonClick={onPromoButtonClick}
            partnerName={partnerName}
            location={location}
            coins={coins}
            walletBalance={walletBalance}
            onTabChange={onTabChange}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <ErrorBoundary>
        <Suspense fallback={<div className="h-16 bg-slate-100 animate-pulse" />}>
          <PartnerHeader
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
        {renderTabContent()}
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
