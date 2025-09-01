import React, { useMemo, useCallback } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function WorkingSchedule() {
  const router = useRouter();
  
  // Memoize working days calculation to prevent recalculation on every render
  const workingDays = useMemo(() => {
    const days = [];
    const today = new Date();
    
    // Only show 2 days as per the image design
    for (let i = 0; i < 2; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        isWorking: Math.random() > 0.3, // 70% chance of working
        isToday: i === 0,
        isTomorrow: i === 1
      });
    }
    
    return days;
  }, []);

  const handleCalendarClick = useCallback(() => {
    router.push('/partner/calendar');
  }, [router]);

  return (
    <Card className="border border-slate-200 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-slate-900 flex items-center space-x-2">
          <CalendarIcon className="h-4 w-4 text-blue-500" />
          <span>Working Schedule</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* Left side - Working Days */}
          <div className="flex items-center space-x-12">
            {workingDays.map((day, index) => (
              <div 
                key={index} 
                className="flex flex-col items-start space-y-2"
                role="gridcell"
                aria-label={`${day.fullDate} - ${day.isWorking ? 'Working' : 'Off'}`}
              >
                {/* Date Display */}
                <div className="text-sm font-bold text-slate-900">
                  {day.fullDate}
                </div>
                
                {/* Working Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    day.isWorking ? 'bg-green-500' : 'bg-slate-400'
                  }`}></div>
                  <span className={`text-xs font-medium ${
                    day.isWorking ? 'text-green-600' : 'text-slate-500'
                  }`}>
                    {day.isWorking ? 'WORKING' : 'OFF'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right side - Calendar Icon (Clickable) */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCalendarClick}
              className="h-8 w-8 hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Open calendar view"
            >
              <CalendarIcon className="h-5 w-5 text-slate-600" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
