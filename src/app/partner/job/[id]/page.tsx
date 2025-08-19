"use client";

import React from 'react';
import { ArrowLeftIcon, MapPinIcon, InfoIcon, TrendingUpIcon, ThumbsUpIcon, ThumbsDownIcon, ShareIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface JobDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export default function JobDetailsPage({ params }: JobDetailsProps) {
  const router = useRouter();
  
  // Unwrap params using React.use()
  const { id } = React.use(params);
  
  // Mock job data - in real app, this would come from API based on id
  const jobData = {
    id: id,
    isExclusive: true,
    scheduledTime: 'Tomorrow, 4:00 pm',
    clientName: 'Hemal',
    address: '1303, Lokhandwala Complex Rd, SV Patel Nagar, Andheri West, Mumbai, Maharashtra 400061, India',
    service: 'Classic bathroom cleaning',
    quantity: 1,
    basePrice: 1117,
    convenienceFee: 79,
    surgePrice: 100,
    total: 1290,
    rating: 3
  };

  const handleBack = () => {
    router.back();
  };

  const handleSeeOnMap = () => {
    // Handle map view functionality
    console.log('See on map clicked');
  };

  const handleInfoClick = () => {
    // Handle info icon click
    console.log('Info clicked');
  };

  const handleThumbsUp = () => {
    console.log('Thumbs up clicked');
  };

  const handleThumbsDown = () => {
    console.log('Thumbs down clicked');
  };

  const handleShare = () => {
    console.log('Share clicked');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Job Header Section */}
        <div className="space-y-4">
          {/* EXCLUSIVE Badge */}
          {jobData.isExclusive && (
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1 text-xs font-bold">
              EXCLUSIVE
            </Badge>
          )}

          {/* Main Heading - Scheduled Time */}
          <h1 className="text-2xl font-bold text-slate-900">
            {jobData.scheduledTime}
          </h1>

          {/* Client Name and Address */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <span className="text-lg font-medium text-slate-900">
                {jobData.clientName}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-base text-slate-700 leading-relaxed">
                {jobData.address}
              </span>
            </div>

            {/* See on Map Button and Info Icon */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                onClick={handleSeeOnMap}
              >
                <MapPinIcon className="h-4 w-4 mr-2" />
                See on map
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                onClick={handleInfoClick}
              >
                <InfoIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Surge Price Information */}
        <Card className="border-0 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUpIcon className="h-5 w-5 text-green-600" />
              <div>
                <span className="text-lg font-semibold text-green-700">
                  ₹ {jobData.surgePrice} extra
                </span>
                <p className="text-sm text-green-600">
                  surge price for this job
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Job details
          </h2>

          <Card className="border border-slate-200">
            <CardContent className="p-4 space-y-4">
              {/* Service and Rating Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-base font-medium text-slate-900">
                    {jobData.service}
                  </span>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                    {jobData.service} x {jobData.quantity}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">{jobData.rating}</span>
                  <ThumbsUpIcon className="h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Classic bathroom cleaning</span>
                  <span className="text-sm font-medium text-slate-900">₹{jobData.basePrice}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Convenience Fee</span>
                  <span className="text-sm font-medium text-slate-900">₹{jobData.convenienceFee}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Surge price</span>
                  <span className="text-sm font-medium text-slate-900">₹{jobData.surgePrice}</span>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-base font-semibold text-slate-900">Total</span>
                  <span className="text-lg font-bold text-slate-900">₹{jobData.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side Action Icons */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 space-y-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-white shadow-lg border border-slate-200 hover:bg-slate-50"
            onClick={handleThumbsUp}
          >
            <ThumbsUpIcon className="h-5 w-5 text-slate-600" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-white shadow-lg border border-slate-200 hover:bg-slate-50"
            onClick={handleThumbsDown}
          >
            <ThumbsDownIcon className="h-5 w-5 text-slate-600" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-white shadow-lg border border-slate-200 hover:bg-slate-50"
            onClick={handleShare}
          >
            <ShareIcon className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}
