import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TaskCardProps } from './types';
import { useGlobalOrderService } from '@/hooks/useGlobalOrderService';
import { 
  TaskHeader, 
  CustomerInfo, 
  LocationInfo, 
  TimeInfo, 
  FinancialInfo, 
  TaskActions 
} from './components';

export default function TaskCard({ task, onAcceptTask, onViewDetails, isAccepting = false }: TaskCardProps) {
  const { partner } = useGlobalOrderService();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <TaskHeader 
        title={task.title} 
        description={task.description}
        partnerName={partner?.name}
      />
      
      <CardContent className="space-y-4">
        <CustomerInfo 
          customerName={task.customerName} 
        />

        <LocationInfo location={task.location} />

        <TimeInfo 
          serviceDate={task.serviceDate}
          timeSlot={task.timeSlot}
          estimatedDuration={task.estimatedDuration}
        />

        <Separator />

        <FinancialInfo 
          amount={task.amount} 
          advanceAmount={task.advanceAmount} 
        />
      </CardContent>

                  <CardFooter className="pt-0">
                    <TaskActions
                      taskId={task.id}
                      isAccepting={isAccepting}
                      onAcceptTask={onAcceptTask}
                      onViewDetails={onViewDetails}
                      advanceAmount={task.advanceAmount}
                    />
                  </CardFooter>
    </Card>
  );
}
