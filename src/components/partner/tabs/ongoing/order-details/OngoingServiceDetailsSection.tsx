import React from 'react';
import { CalendarIcon, ClockIcon, FileTextIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OngoingServiceDetailsSectionProps } from './types';
import { formatDate } from '../utils/currencyUtils';

export default function OngoingServiceDetailsSection({ service }: OngoingServiceDetailsSectionProps) {
  const getTimeSlotDisplay = (slotCode: string) => {
    if (!slotCode) return service.estimatedDuration || 'Time TBD';
    
    const timeSlotMap: { [key: string]: string } = {
      '4972': '8:00AM - 10:00AM',
      '4974': '10:00AM - 12:00PM', 
      '4976': '12:00PM - 2:00PM',
      '4978': '2:00PM - 4:00PM',
      '4980': '4:00PM - 6:00PM',
      '4982': '6:00PM - 8:00PM'
    };
    
    const mappedTime = timeSlotMap[slotCode];
    if (mappedTime) {
      return mappedTime;
    }
    
    // If it's not a known code, check if it's already a readable time format
    if (slotCode.includes('AM') || slotCode.includes('PM') || slotCode.includes('-')) {
      return slotCode;
    }
    
    return service.estimatedDuration || slotCode || 'Time TBD';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Service Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">{service.title}</h3>
          <p className="text-sm text-gray-600">{service.description}</p>
        </div>

        {service.instructions && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Instructions</h4>
            <p className="text-sm text-gray-600">{service.instructions}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm text-gray-500">Service Date</div>
              <div className="font-medium">{formatDate(service.serviceDate)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm text-gray-500">Service Time</div>
              <div className="font-medium">{getTimeSlotDisplay(service.serviceTime)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm text-gray-500">Duration</div>
              <div className="font-medium">{service.estimatedDuration}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileTextIcon className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm text-gray-500">Category</div>
              <div className="font-medium">{service.category}</div>
            </div>
          </div>
        </div>

        {service.status === 'in-progress' && service.currentPhase && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900">Current Phase</div>
            <div className="text-sm text-blue-700">{service.currentPhase}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
