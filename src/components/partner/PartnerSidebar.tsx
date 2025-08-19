import React, { useEffect, useRef } from 'react';
import { XIcon, UserIcon, SettingsIcon, LogOutIcon, BellIcon, CreditCardIcon, HelpCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

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
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management when sidebar opens
  useEffect(() => {
    if (isOpen) {
      // Focus the close button when sidebar opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
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

  const menuItems = [
    {
      icon: UserIcon,
      label: 'Profile',
      onClick: () => console.log('Profile clicked')
    },
    {
      icon: BellIcon,
      label: 'Notifications',
      onClick: () => console.log('Notifications clicked')
    },
    {
      icon: CreditCardIcon,
      label: 'Payment Methods',
      onClick: () => console.log('Payment clicked')
    },
    {
      icon: SettingsIcon,
      label: 'Settings',
      onClick: () => console.log('Settings clicked')
    },
    {
      icon: HelpCircleIcon,
      label: 'Help & Support',
      onClick: () => console.log('Help clicked')
    }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-72 p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          closeButtonRef.current?.focus();
        }}
      >
        <SheetHeader className="px-4 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-medium text-slate-900">Menu</SheetTitle>
            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Close menu"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
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
                onClick={item.onClick}
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
