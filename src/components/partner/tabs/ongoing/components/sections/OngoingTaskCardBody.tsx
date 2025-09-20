import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OngoingTask } from '../../types';
import { 
  OngoingCustomerInfo, 
  OngoingLocationInfo, 
  OngoingTimeInfo, 
  OngoingFinancialInfo 
} from '../';

interface OngoingTaskCardBodyProps {
  task: OngoingTask;
  onTaskExpired?: (taskId: string) => void;
  onTaskCompleted?: (taskId: string) => void;
}

export default function OngoingTaskCardBody({ task, onTaskExpired, onTaskCompleted }: OngoingTaskCardBodyProps) {
  return (
    <CardContent className="space-y-4">
      {/* Customer Information Section */}
      <OngoingCustomerInfo 
        customerName={task.customerName} 
        customerPhone={task.customerPhone}
      />

      {/* Location Information Section */}
      <OngoingLocationInfo 
        location={task.location} 
        customerAddress={task.customerAddress}
      />

      {/* Time Information Section */}
        <OngoingTimeInfo 
          serviceDate={task.serviceDate}
          serviceTime={task.serviceTime}
          duration={task.duration}
          startTime={task.startTime}
          estimatedEndTime={task.estimatedEndTime}
          actualStartTime={task.actualStartTime}
          status={task.status}
          onExpired={() => onTaskExpired?.(task.id)}
          onTaskCompleted={onTaskCompleted}
          onTaskExpired={onTaskExpired}
          taskId={task.id}
        />

      <Separator />

      {/* Financial Information Section */}
      <OngoingFinancialInfo 
        amount={task.amount} 
        advanceAmount={task.advanceAmount}
        balanceAmount={task.balanceAmount}
        commissionAmount={task.commissionAmount}
        status={task.status}
        mode={task.mode}
      />
    </CardContent>
  );
}
