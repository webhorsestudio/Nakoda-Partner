import React from 'react';
import { RadarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import JobOverview from './sections/JobOverview';

interface JobListingsProps {
  totalOrders?: number;
  onViewAllJobs: () => void;
}

export default function JobListings({ totalOrders = 0, onViewAllJobs }: JobListingsProps) {
  return (
    <div className="space-y-4">
      {/* Job Overview Section */}
      <JobOverview 
        totalOrders={totalOrders}
        onViewAllJobs={onViewAllJobs}
      />

      {/* Job Cards - Show animated radar when there are ongoing tasks */}
      {totalOrders === 0 ? (
        <Card className="border border-slate-200 bg-white">
          <CardContent className="p-8 text-center">
            <div className="relative mx-auto mb-4 w-12 h-12">
              <RadarIcon className="h-12 w-12 text-blue-500 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping"></div>
            </div>
            <h3 className="text-lg font-medium text-slate-900">Looking for New Job...</h3>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-slate-200 bg-white">
          <CardContent className="p-8 text-center">
            <div className="relative mx-auto mb-4 w-12 h-12">
              <RadarIcon className="h-12 w-12 text-blue-500 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping"></div>
            </div>
            <h3 className="text-lg font-medium text-slate-900">Looking for New Jobs...</h3>
            <p className="text-sm text-slate-500 mt-2">
              You have {totalOrders} ongoing job{totalOrders !== 1 ? 's' : ''}. Click &quot;View all&quot; to manage them.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
