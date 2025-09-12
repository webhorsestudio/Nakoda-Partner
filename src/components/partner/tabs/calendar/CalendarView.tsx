import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, ClockIcon, MapPinIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CalendarViewProps {
  partnerName?: string;
  location?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  type: 'job' | 'break' | 'meeting';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export default function CalendarView({ partnerName, location }: CalendarViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sample events data
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'House Cleaning - Sector 15',
      time: '09:00 AM',
      location: 'Sector 15, Gurgaon',
      type: 'job',
      status: 'scheduled'
    },
    {
      id: '2',
      title: 'Lunch Break',
      time: '01:00 PM',
      location: 'Office',
      type: 'break',
      status: 'scheduled'
    },
    {
      id: '3',
      title: 'Office Cleaning - Cyber City',
      time: '03:00 PM',
      location: 'Cyber City, Gurgaon',
      type: 'job',
      status: 'scheduled'
    }
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const getEventsForDate = (date: Date) => {
    // In a real app, this would filter events based on the date
    return events;
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'job':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'break':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'meeting':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Working Calendar</h1>
            <p className="text-sm text-gray-600">Manage your schedule and work hours</p>
          </div>
          <button
            onClick={() => router.push('/partner')}
            className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <ChevronRightIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => day && setSelectedDate(day)}
              className={`p-2 text-center text-sm rounded-lg transition-colors ${
                day
                  ? isToday(day)
                    ? 'bg-blue-600 text-white font-semibold'
                    : isSelected(day)
                    ? 'bg-blue-100 text-blue-900 font-semibold'
                    : 'hover:bg-gray-100 text-gray-900'
                  : 'text-gray-300'
              }`}
            >
              {day ? day.getDate() : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Date Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            <PlusIcon className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Add Event</span>
          </button>
        </div>

        {selectedDateEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedDateEvents.map(event => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <ClockIcon className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-600 font-medium">No events scheduled</p>
            <p className="text-sm text-gray-500 mt-1">Add an event to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
