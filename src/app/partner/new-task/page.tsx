'use client';

import React, { useState, memo, useCallback } from 'react';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { PartnerHeader, PartnerSidebar, BottomNavigation } from '@/components/partner';
import NewTaskTabWrapper from '@/components/partner/tabs/new-task/NewTaskTabWrapper';

const NewTaskPage = memo(function NewTaskPage() {
  const { partnerInfo, error, isLoading, logout } = usePartnerAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabChange = useCallback((tabId: string) => {
    if (tabId === 'new-task') {
      return; // Already on this page
    }
    // Navigate to other tabs
    window.location.href = `/partner/${tabId === 'home' ? '' : tabId}`;
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  // Show loading state
  if (isLoading) {
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
    <div className="min-h-screen bg-white pb-32">
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
        <NewTaskTabWrapper />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="new-task" onTabChange={handleTabChange} />
    </div>
  );
});

export default NewTaskPage;
