'use client';

import React, { useState } from 'react';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { usePartnerOrders } from '@/hooks/usePartnerOrders';
import { PartnerHeader, PartnerSidebar, BottomNavigation } from '@/components/partner';
import ReportingTab from '@/components/partner/tabs/reporting/ReportingTab';

export default function ReportingPage() {
  const { partnerInfo, error, isLoading, logout } = usePartnerAuth();
  const { totalOrders, isLoading: ordersLoading } = usePartnerOrders(partnerInfo?.mobile);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Calculate coins from total revenue (1 coin = ₹100)
  const coins = partnerInfo?.total_revenue ? Math.floor(partnerInfo.total_revenue / 100) : 0;

  const handleTabChange = (tabId: string) => {
    if (tabId === 'reporting') {
      return; // Already on this page
    }
    // Navigate to other tabs
    window.location.href = `/partner/${tabId === 'home' ? '' : tabId}`;
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show loading state
  if (isLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-32">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-slate-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="w-32 h-6 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="w-8 h-8 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="px-4 py-4 space-y-8">
          {/* Header Section Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-48 h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="w-64 h-4 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Time Range Selector Skeleton */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-20 h-8 bg-slate-200 rounded animate-pulse"></div>
              ))}
            </div>

            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="w-24 h-4 bg-slate-200 rounded animate-pulse mb-1"></div>
                      <div className="w-16 h-3 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="w-20 h-8 bg-slate-200 rounded animate-pulse"></div>
                    <div className="w-12 h-4 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Metrics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="w-28 h-4 bg-slate-200 rounded animate-pulse mb-1"></div>
                      <div className="w-20 h-3 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-slate-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Performance Table Skeleton */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="w-48 h-6 bg-slate-200 rounded animate-pulse"></div>
                <div className="w-32 h-4 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Table Header Skeleton */}
                <div className="grid grid-cols-6 gap-4 pb-3 border-b border-slate-200">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-full h-4 bg-slate-200 rounded animate-pulse"></div>
                  ))}
                </div>
                {/* Table Rows Skeleton */}
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} className="grid grid-cols-6 gap-4 py-3">
                    {[1, 2, 3, 4, 5, 6].map((col) => (
                      <div key={col} className="w-full h-4 bg-slate-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Skeleton */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2">
          <div className="flex justify-around">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 bg-slate-200 rounded animate-pulse"></div>
                <div className="w-12 h-3 bg-slate-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error if any
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <PartnerHeader
        onMenuClick={handleToggleSidebar}
      />

      {/* Sidebar */}
      <PartnerSidebar
        isOpen={sidebarOpen}
        onClose={handleToggleSidebar}
        onLogout={logout}
      />

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4">
        <ReportingTab />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="reporting" onTabChange={handleTabChange} />
    </div>
  );
}
