'use client';

import React from 'react';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { usePartnerOrders } from '@/hooks/usePartnerOrders';
import { PartnerHeader, BottomNavigation } from '@/components/partner';
import OngoingTaskTab from '@/components/partner/tabs/ongoing/OngoingTaskTab';

export default function OngoingPage() {
  const { partnerInfo, error, isLoading } = usePartnerAuth();
  const { totalOrders, isLoading: ordersLoading } = usePartnerOrders(partnerInfo?.mobile);
  
  // Calculate coins from total revenue (1 coin = ₹100)
  const coins = partnerInfo?.total_revenue ? Math.floor(partnerInfo.total_revenue / 100) : 0;

  const handleTabChange = (tabId: string) => {
    if (tabId === 'ongoing') {
      return; // Already on this page
    }
    // Navigate to other tabs
    window.location.href = `/partner/${tabId === 'home' ? '' : tabId}`;
  };

  // Show loading state
  if (isLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
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
        coins={coins}
        onMenuClick={() => console.log('Menu clicked')}
      />

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4">
        <OngoingTaskTab />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="ongoing" onTabChange={handleTabChange} />
    </div>
  );
}
