"use client";

import { useState, useCallback } from "react";
import { usePartnerAuth } from "@/hooks/usePartnerAuth";
import { usePartnerOrders } from "@/hooks/usePartnerOrders";
import {
  PartnerDashboardContent,
  LoadingSpinner,
  ErrorDisplay
} from "@/components/partner";

export default function PartnerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  const { partnerInfo, error, isLoading, logout } = usePartnerAuth();
  const { totalOrders, isLoading: ordersLoading } = usePartnerOrders(partnerInfo?.mobile);
  
  // Get partner name from database or use default
  const displayName = partnerInfo?.name || 'Partner';
  const displayLocation = partnerInfo?.location || partnerInfo?.city || 'Location not specified';
  
  // Calculate coins from total revenue (1 coin = ₹100)
  const coins = partnerInfo?.total_revenue ? Math.floor(partnerInfo.total_revenue / 100) : 0;

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const handlePromoButtonClick = useCallback(() => {
    // Handle promotional button click
    console.log('Promotional button clicked');
  }, []);

  // Show loading state
  if (isLoading || ordersLoading) {
    return <LoadingSpinner />;
  }

  // Show error if any
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <PartnerDashboardContent
      partnerName={displayName}
      location={displayLocation}
      sidebarOpen={sidebarOpen}
      activeTab={activeTab}
      coins={coins}
      totalOrders={totalOrders}
      onToggleSidebar={toggleSidebar}
      onTabChange={handleTabChange}
      onLogout={logout}
      onPromoButtonClick={handlePromoButtonClick}
    />
  );
}
