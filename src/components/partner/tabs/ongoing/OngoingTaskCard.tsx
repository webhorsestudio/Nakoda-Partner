import React from 'react';
import { MapPinIcon, ClockIcon, UserIcon, CreditCardIcon, PlayIcon, CheckCircleIcon, EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OngoingTaskCardProps } from './types';
import TaskStatusBadge from './TaskStatusBadge';

export default function OngoingTaskCard({ 
  task, 
  onViewDetails, 
  onStartTask, 
  onCompleteTask 
}: OngoingTaskCardProps) {
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in-progress';

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-slate-200 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-slate-900 line-clamp-2 mb-2">
              {task.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <TaskStatusBadge status={task.status} size="sm" />
              <span className="text-sm text-slate-500">#{task.orderNumber}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="flex items-center gap-2 text-slate-600">
          <UserIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{task.customerName}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-slate-600">
          <MapPinIcon className="w-4 h-4" />
          <span className="text-sm">{task.location}</span>
        </div>

        {/* Current Phase */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-sm font-medium text-slate-700 mb-1">Current Phase</div>
          <div className="text-sm text-slate-600">{task.currentPhase}</div>
        </div>

        {/* Service Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600">{task.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCardIcon className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600">₹{task.amount}</span>
          </div>
        </div>

        {/* Timing Info */}
        {task.startTime && (
          <div className="bg-slate-50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Started:</span>
              <span className="text-slate-900 font-medium">{task.startTime}</span>
            </div>
            {task.estimatedEndTime && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Estimated End:</span>
                <span className="text-slate-900 font-medium">{task.estimatedEndTime}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onViewDetails(task.id)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <EyeIcon className="w-4 h-4 mr-1" />
            View Details
          </Button>
          
          {!isCompleted && (
            <>
              {!isInProgress && (
                <Button
                  onClick={() => onStartTask(task.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <PlayIcon className="w-4 h-4 mr-1" />
                  Start
                </Button>
              )}
              
              <Button
                onClick={() => onCompleteTask(task.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Complete
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
