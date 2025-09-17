import React from 'react';
import { ClockIcon, MapPinIcon, CalendarIcon, NavigationIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OngoingOrderDetailsHeaderProps } from './types';
import { getCleanServiceTitle } from '../utils/titleUtils';
import { formatCurrency, formatDate } from '../utils/currencyUtils';

export default function OngoingOrderDetailsHeader({ order, onClose }: OngoingOrderDetailsHeaderProps) {
  const cleanTitle = getCleanServiceTitle(order.description || '');
  
  const getTimeSlotDisplay = (slotCode: string) => {
    if (!slotCode) return order.duration || 'Time TBD';
    
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
    
    return order.duration || slotCode || 'Time TBD';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{cleanTitle}</h1>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Order #</span>
            <span className="text-sm font-semibold text-gray-900">{order.orderNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Amount:</span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-500">Service Date</div>
              <div className="font-medium">{formatDate(order.serviceDate)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-500">Service Time</div>
              <div className="font-medium">{getTimeSlotDisplay(order.serviceTime)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <NavigationIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-500">Location</div>
              <div className="font-medium">{order.location}</div>
              {order.customerAddress && (
                <div className="text-sm text-gray-600">{order.customerAddress}</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

