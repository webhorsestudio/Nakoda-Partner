import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CountdownTimer from '../components/CountdownTimer';
import { OngoingOrderActionsProps } from './types';

export default function OngoingOrderActions({ 
  serviceDate,
  serviceTime,
  status,
  onTaskExpired,
  onTaskCompleted,
  taskId
}: OngoingOrderActionsProps) {
  return (
    <Card className="w-full border-t-0 rounded-t-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-center">
          {serviceDate && serviceTime && status !== 'completed' && status !== 'cancelled' && (
            <CountdownTimer
              serviceDate={serviceDate}
              serviceTime={serviceTime}
              onExpired={onTaskExpired}
              onTaskCompleted={onTaskCompleted}
              onTaskExpired={onTaskExpired}
              taskId={taskId}
              className="text-lg"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
