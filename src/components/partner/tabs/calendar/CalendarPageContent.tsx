import React, { Suspense } from 'react';
import { PartnerHeader, PartnerSidebar, BottomNavigation, ErrorBoundary } from '../../index';
import CalendarView from './CalendarView';

interface CalendarPageContentProps {
  partnerName?: string;
  location?: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export default function CalendarPageContent({
  partnerName,
  location,
  sidebarOpen,
  onToggleSidebar,
  onLogout
}: CalendarPageContentProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-32">
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
      <div className="px-4 py-4">
        <CalendarView 
          partnerName={partnerName}
          location={location}
        />
      </div>

      {/* Bottom Navigation */}
      <ErrorBoundary>
        <BottomNavigation
          activeTab="calendar"
          onTabChange={(tabId) => {
            if (tabId === 'calendar') {
              return; // Already on calendar
            }
            // Navigate to other tabs
            window.location.href = `/partner/${tabId}`;
          }}
        />
      </ErrorBoundary>
    </div>
  );
}
