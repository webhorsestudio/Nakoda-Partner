import React from 'react';
import { ArrowLeftIcon, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
  onBack: () => void;
}

export default function ProfileHeader({ onBack }: ProfileHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <UserIcon className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Partner Profile</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
