import React from 'react';
import { ClockIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <ClockIcon className="w-12 h-12 text-slate-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        No Ongoing Tasks
      </h3>
      
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        You don&apos;t have any tasks in progress right now. Check the &quot;New Tasks&quot; tab to find available opportunities.
      </p>
      
      <Button
        onClick={() => window.location.href = '/partner/new-task'}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <PlusIcon className="w-4 h-4 mr-2" />
        Browse New Tasks
      </Button>
    </div>
  );
}
