import React from 'react';
import { Button } from '@/components/ui/button';

interface ProfileErrorStateProps {
  error: string;
  onBack: () => void;
}

export default function ProfileErrorState({ error, onBack }: ProfileErrorStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
          Go Back
        </Button>
      </div>
    </div>
  );
}
