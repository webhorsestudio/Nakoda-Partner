"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePartnerAuth } from "@/hooks/usePartnerAuth";
import { LoadingSpinner, ErrorDisplay } from "@/components/partner";
import CalendarPageContent from "@/components/partner/tabs/calendar/CalendarPageContent";

export default function CalendarPage() {
  const router = useRouter();
  const { partnerInfo, error, isLoading, logout } = usePartnerAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get partner name from database or use default
  const displayName = partnerInfo?.name || 'Partner';
  const displayLocation = partnerInfo?.location || partnerInfo?.city || 'Location not specified';

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show error if any
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <CalendarPageContent
      partnerName={displayName}
      location={displayLocation}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={handleToggleSidebar}
      onLogout={logout}
    />
  );
}