import React from 'react';
import { HomeIcon, PlusCircleIcon, ClockIcon, BarChart3Icon, DollarSignIcon, UserIcon, CalendarIcon, WalletIcon } from "lucide-react";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  onClick?: () => void;
}

interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export default function BottomNavigation({ 
  activeTab = 'home',
  onTabChange 
}: BottomNavigationProps) {
  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: HomeIcon,
      isActive: activeTab === 'home',
      onClick: () => onTabChange?.('home')
    },
    {
      id: 'new-task',
      label: 'New Task',
      icon: PlusCircleIcon,
      isActive: activeTab === 'new-task',
      onClick: () => onTabChange?.('new-task')
    },
    {
      id: 'ongoing',
      label: 'Ongoing',
      icon: ClockIcon,
      isActive: activeTab === 'ongoing',
      onClick: () => onTabChange?.('ongoing')
    },
    {
      id: 'reporting',
      label: 'Reporting',
      icon: BarChart3Icon,
      isActive: activeTab === 'reporting',
      onClick: () => onTabChange?.('reporting')
    },
    {
      id: 'revenue',
      label: 'Revenue',
      icon: DollarSignIcon,
      isActive: activeTab === 'revenue',
      onClick: () => onTabChange?.('revenue')
    }
  ];

  // Extended navigation items for other pages
  const extendedNavigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: HomeIcon,
      isActive: activeTab === 'home',
      onClick: () => onTabChange?.('home')
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: CalendarIcon,
      isActive: activeTab === 'calendar',
      onClick: () => onTabChange?.('calendar')
    },
    {
      id: 'ongoing',
      label: 'Ongoing',
      icon: ClockIcon,
      isActive: activeTab === 'ongoing',
      onClick: () => onTabChange?.('ongoing')
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: WalletIcon,
      isActive: activeTab === 'wallet',
      onClick: () => onTabChange?.('wallet')
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      isActive: activeTab === 'profile',
      onClick: () => onTabChange?.('profile')
    }
  ];

  // Choose navigation items based on current page context
  const currentNavigationItems = 
    activeTab === 'profile' || activeTab === 'calendar' || activeTab === 'wallet' 
      ? extendedNavigationItems 
      : navigationItems;

  return (
    <nav 
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Dark purple/indigo pill-shaped navigation bar */}
      <div className="bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-900 rounded-full px-4 py-3 shadow-2xl shadow-black/40 border border-white/5">
        <div className="flex justify-around items-center">
          {currentNavigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`relative flex items-center justify-center transition-all duration-300 ease-out group ${
                  item.isActive 
                    ? 'min-w-[80px] min-h-[48px]' 
                    : 'min-w-[48px] min-h-[40px]'
                }`}
                aria-label={`${item.label} ${item.isActive ? '(active)' : ''}`}
                aria-current={item.isActive ? 'page' : undefined}
                role="tab"
              >
                {/* Active state - rectangular rounded corner background */}
                {item.isActive && (
                  <div className="absolute inset-0 bg-white rounded-2xl shadow-lg transform scale-105 transition-all duration-300 ease-out" />
                )}
                
                {/* Icon and Label Container - Horizontal layout for active, vertical for inactive */}
                <div className={`relative z-10 flex items-center ${
                  item.isActive 
                    ? 'flex-row space-x-2 px-2 py-1' 
                    : 'flex-col space-y-1.5'
                }`}>
                  <Icon className={`transition-all duration-300 ${
                    item.isActive 
                      ? 'h-5 w-5 text-indigo-800' 
                      : 'h-5 w-5 text-white/70 group-hover:text-white'
                  }`} />
                  
                  {/* Label - only show for active item */}
                  {item.isActive && (
                    <span className="text-sm font-semibold text-indigo-800 whitespace-nowrap tracking-wide">
                      {item.label}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
