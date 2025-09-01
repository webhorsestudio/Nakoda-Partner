import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StarIcon, CalendarIcon, UserIcon } from 'lucide-react';
import { ReviewCardProps } from './types';

export default function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-500 fill-current' 
            : 'text-slate-300'
        }`}
      />
    ));
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-100 rounded-full">
                <UserIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900">{review.customerName}</div>
                <div className="text-xs text-slate-500">#{review.orderNumber}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {renderStars(review.rating)}
            </div>
          </div>

          {/* Service Type */}
          <div className="inline-block px-2 py-1 bg-slate-100 rounded-full">
            <span className="text-xs font-medium text-slate-700">{review.serviceType}</span>
          </div>

          {/* Comment */}
          <div className="text-sm text-slate-700 leading-relaxed">
            &ldquo;{review.comment}&rdquo;
          </div>

          {/* Date */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <CalendarIcon className="w-3 h-3" />
            <span>{formatDate(review.date)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
