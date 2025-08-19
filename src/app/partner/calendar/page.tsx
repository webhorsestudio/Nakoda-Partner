"use client";

import React, { useState, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, MessageCircleIcon, PhoneIcon, ArrowLeftIcon, CalendarIcon, ClockIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { PartnerHeader, PartnerSidebar, BottomNavigation, ErrorBoundary } from '@/components/partner';

interface Appointment {
  id: string;
  time: string;
  clientName: string;
  service: string;
  status: 'paid' | 'checkout' | 'lunch';
  amount?: number;
}

export default function CalendarPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');
  
  const { partnerInfo, error, isLoading, logout } = usePartnerAuth();
  
  const coins = 4567;
  const displayName = partnerInfo?.name || 'Webhorse Studio';
  const displayLocation = 'Andheri West, Mumbai';
  
  const appointments: Appointment[] = [
    {
      id: '1',
      time: '9:00 AM',
      clientName: 'Lindsey Johnson',
      service: 'Cut & Color',
      status: 'paid',
      amount: 150
    },
    {
      id: '2',
      time: '10:00 AM',
      clientName: 'Amy Fisher',
      service: 'Blowout & Style',
      status: 'checkout'
    },
    {
      id: '3',
      time: '11:00 AM',
      clientName: 'Michael Hamilton',
      service: "Men's Haircut",
      status: 'checkout'
    },
    {
      id: '4',
      time: '12:00 PM',
      clientName: 'Lunch Break',
      service: '',
      status: 'lunch'
    }
  ];

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      router.push('/partner');
    }
  }, [router]);

  const handleBackToPartner = useCallback(() => {
    router.push('/partner');
  }, [router]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ErrorBoundary>
        <PartnerHeader
          partnerName={displayName}
          location={displayLocation}
          coins={coins}
          onMenuClick={toggleSidebar}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <PartnerSidebar
          isOpen={sidebarOpen}
          onClose={toggleSidebar}
          onLogout={logout}
        />
      </ErrorBoundary>

      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToPartner}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Calendar */}
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('prev')}
                className="h-8 w-8"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('next')}
                className="h-8 w-8"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`day-${index}`} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {getDaysInMonth(selectedDate).map((date, index) => (
                <div key={index} className="text-center">
                  {date ? (
                    <button
                      onClick={() => setSelectedDate(date)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        date.toDateString() === selectedDate.toDateString()
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  ) : (
                    <div className="w-10 h-10" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Info */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {formatDate(selectedDate)}
          </h3>
          <p className="text-gray-600">{formatDay(selectedDate)}</p>
        </div>

        {/* Appointments */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h3>
          </div>
          
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <Card key={appointment.id} className="bg-white">
                <CardContent className="p-4">
                  {appointment.status === 'lunch' ? (
                    <div className="text-center py-4">
                      <div className="text-sm text-gray-500 mb-2">{appointment.time}</div>
                      <h4 className="text-lg font-semibold text-gray-900">Lunch Break</h4>
                      <p className="text-gray-600 text-sm">Time to recharge</p>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {appointment.time}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            appointment.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {appointment.status === 'paid' ? 'Paid' : 'Checkout'}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {appointment.clientName}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">
                          {appointment.service}
                        </p>
                        {appointment.amount && (
                          <p className="text-sm font-medium text-green-600">
                            ${appointment.amount}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-700"
                        >
                          <MessageCircleIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-700"
                        >
                          <PhoneIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white">
              <CardContent className="p-8 text-center">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments</h3>
                <p className="text-gray-500">You&apos;re all caught up for today!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ErrorBoundary>
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </ErrorBoundary>
    </div>
  );
}
