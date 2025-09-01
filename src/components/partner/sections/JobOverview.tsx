import React from 'react';
import { ClockIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface JobOverviewProps {
  totalOrders?: number;
  onViewAllJobs: () => void;
}

export default function JobOverview({ totalOrders = 0, onViewAllJobs }: JobOverviewProps) {
  return (
    <Card className="border border-slate-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 rounded-full p-2">
              <ClockIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Schedule Jobs
              </h2>
              <p className="text-sm text-slate-600">
                {totalOrders > 0 
                  ? `${totalOrders} allocated job${totalOrders !== 1 ? 's' : ''}`
                  : 'No jobs allocated yet'
                }
              </p>
            </div>
          </div>
          <Button
            onClick={onViewAllJobs}
            className="bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            size="sm"
          >
            View all
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
