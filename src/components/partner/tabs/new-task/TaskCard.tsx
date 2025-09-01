import React from 'react';
import { MapPinIcon, ClockIcon, UserIcon, CreditCardIcon, ZapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCardProps } from './types';

export default function TaskCard({ task, onAcceptTask, onViewDetails }: TaskCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-[#0F52BA] shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-slate-900 line-clamp-2">
          {task.title}
        </CardTitle>
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

        {/* Financial Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium text-slate-700">Advance</div>
            <div className="text-green-600">₹{task.advanceAmount}</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-slate-700">Countdown</div>
            <div className="text-red-600 font-mono">{task.countdown}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onAcceptTask(task.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <ZapIcon className="w-4 h-4 mr-1" />
            Accept Task
          </Button>
          <Button 
            onClick={() => onViewDetails(task.id)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
