import React, { useEffect, useRef } from 'react';
import { UserIcon, SettingsIcon, LogOutIcon, BellIcon, CreditCardIcon, HelpCircleIcon, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

interface PartnerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function PartnerSidebar({ 
  isOpen, 
  onClose, 
  onLogout 
}: PartnerSidebarProps) {
  const router = useRouter();
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  // Focus management when sidebar opens
  useEffect(() => {
    if (isOpen) {
      // Focus the first menu item when sidebar opens
      setTimeout(() => {
        firstMenuItemRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleMenuClick = (action: string) => {
    onClose(); // Close sidebar first
    
    switch (action) {
      case 'profile':
        router.push('/partner/profile');
        break;
      case 'notifications':
        // TODO: Implement notifications page
        console.log('Notifications clicked');
        break;
      case 'payment':
        // TODO: Implement payment methods page
        console.log('Payment methods clicked');
        break;
      case 'calendar':
        router.push('/partner/calendar');
        break;
      case 'settings':
        // TODO: Implement settings page
        console.log('Settings clicked');
        break;
      case 'help':
        // TODO: Implement help & support page
        console.log('Help & support clicked');
        break;
      default:
        break;
    }
  };

  const menuItems = [
    {
      icon: UserIcon,
      label: 'Profile',
      action: 'profile'
    },
    {
      icon: BellIcon,
      label: 'Notifications',
      action: 'notifications'
    },
    {
      icon: CreditCardIcon,
      label: 'Payment Methods',
      action: 'payment'
    },
    {
      icon: CalendarIcon,
      label: 'Working Calendar',
      action: 'calendar'
    },
    {
      icon: SettingsIcon,
      label: 'Settings',
      action: 'settings'
    },
    {
      icon: HelpCircleIcon,
      label: 'Help & Support',
      action: 'help'
    }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-72 p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          firstMenuItemRef.current?.focus();
        }}
      >
        <SheetHeader className="px-4 py-4 border-b border-slate-200">
          <SheetTitle className="text-lg font-medium text-slate-900">Menu</SheetTitle>
        </SheetHeader>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-1" role="navigation" aria-label="Sidebar menu">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                ref={index === 0 ? firstMenuItemRef : undefined}
                variant="ghost"
                className="w-full justify-start h-10 text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => handleMenuClick(item.action)}
                aria-label={item.label}
              >
                <Icon className="mr-3 h-4 w-4 text-slate-500" />
                {item.label}
              </Button>
            );
          })}
        </nav>
        
        <Separator className="mx-4" />
        
        {/* Logout Section */}
        <div className="px-4 py-4">
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={onLogout}
            aria-label="Logout from account"
          >
            <LogOutIcon className="mr-3 h-4 w-4 text-red-500" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
