import React from 'react';
import { ClockIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import WorkingSchedule from './sections/WorkingSchedule';
import JobOverview from './sections/JobOverview';

interface JobListingsProps {
  totalOrders?: number;
  onViewAllJobs: () => void;
}

export default function JobListings({ totalOrders = 0, onViewAllJobs }: JobListingsProps) {
  return (
    <div className="space-y-4">
      {/* Working Schedule Section */}
      <WorkingSchedule />

      {/* Job Overview Section */}
      <JobOverview 
        totalOrders={totalOrders}
        onViewAllJobs={onViewAllJobs}
      />

      {/* Job Cards - Show message if no orders */}
      {totalOrders === 0 ? (
        <Card className="border border-slate-200 bg-white">
          <CardContent className="p-8 text-center">
            <ClockIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs allocated</h3>
            <p className="text-slate-500">You don&apos;t have any jobs assigned yet. Check back later!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3" role="list" aria-label="Available jobs">
          {/* This will be populated by the usePartnerOrders hook */}
          <div className="text-center py-4">
            <p className="text-slate-600">Jobs will be loaded from the database</p>
            <p className="text-sm text-slate-500">Total orders: {totalOrders}</p>
          </div>
        </div>
      )}
    </div>
  );
}
