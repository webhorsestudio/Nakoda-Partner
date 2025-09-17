"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePartnerAuth } from "@/hooks/usePartnerAuth";
import { usePartnerOrders } from "@/hooks/usePartnerOrders";
import { usePartnerWallet } from "@/hooks/usePartnerWallet";
import {
  PartnerDashboardContent,
  LoadingSpinner,
  ErrorDisplay
} from "@/components/partner";

export default function PartnerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const walletFetched = useRef(false);
  
  const { partnerInfo, error, isLoading, logout } = usePartnerAuth();
  const { totalOrders, isLoading: ordersLoading } = usePartnerOrders(partnerInfo?.mobile);
  const { balance: walletBalance, fetchBalance, isLoading: walletLoading } = usePartnerWallet();
  
  // Get partner name from database or use default
  const displayName = partnerInfo?.name || 'Partner';
  const displayLocation = partnerInfo?.location || partnerInfo?.city || 'Location not specified';
  
  // Calculate coins from total revenue (1 coin = ₹100)
  const coins = partnerInfo?.total_revenue ? Math.floor(partnerInfo.total_revenue / 100) : 0;
  
  // Get wallet balance for header display
  const walletAmount = walletBalance || 0;

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch wallet balance when component mounts
  useEffect(() => {
    if (partnerInfo?.id && !walletLoading && !walletFetched.current) {
      walletFetched.current = true;
      fetchBalance();
    }
  }, [partnerInfo?.id, walletLoading]);

  // Redirect to proper routes based on tab parameter
  useEffect(() => {
    if (!isLoading && !ordersLoading) {
      if (tab === 'new-task') {
        router.replace('/partner/new-task');
      } else if (tab === 'ongoing') {
        router.replace('/partner/ongoing');
      } else if (tab === 'reporting') {
        router.replace('/partner/reporting');
      } else if (tab === 'revenue') {
        router.replace('/partner/revenue');
      }
      // For 'home' or no tab, stay on this page
    }
  }, [tab, isLoading, ordersLoading, router]);

  // Show loading state
  if (isLoading || ordersLoading || walletLoading) {
    return <LoadingSpinner />;
  }

  // Show error if any
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Only show home tab content
  return (
    <PartnerDashboardContent
      partnerName={displayName}
      location={displayLocation}
      sidebarOpen={sidebarOpen}
      activeTab="home"
      coins={coins}
      walletBalance={walletAmount}
      totalOrders={totalOrders}
      onToggleSidebar={handleToggleSidebar}
      onTabChange={(tabId) => {
        if (tabId === 'home') {
          return; // Already on home
        }
        router.push(`/partner/${tabId}`);
      }}
      onLogout={logout}
      onPromoButtonClick={() => console.log('Promotional button clicked')}
    />
  );
}
