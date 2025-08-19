import React from 'react';
import { HomeIcon, PlusCircleIcon, ClockIcon, DollarSignIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      id: 'revenue',
      label: 'Revenue',
      icon: DollarSignIcon,
      isActive: activeTab === 'revenue',
      onClick: () => onTabChange?.('revenue')
    }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-around py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={item.onClick}
              className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                item.isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
              aria-label={`${item.label} ${item.isActive ? '(active)' : ''}`}
              aria-current={item.isActive ? 'page' : undefined}
              role="tab"
            >
              <Icon className={`h-5 w-5 ${item.isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              <span className={`text-xs font-medium ${item.isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
