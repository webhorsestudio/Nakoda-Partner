import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarIcon, EyeIcon } from 'lucide-react';
import { CustomerReviewsProps } from './types';
import ReviewCard from './ReviewCard';

export default function CustomerReviews({ reviews, onViewAll }: CustomerReviewsProps) {
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Customer Reviews
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-slate-900">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-slate-500">
                ({totalReviews} reviews)
              </span>
            </div>
          </div>
          <Button
            onClick={onViewAll}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <EyeIcon className="w-4 h-4" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.slice(0, 3).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
        
        {reviews.length > 3 && (
          <div className="mt-4 pt-4 border-t border-slate-200 text-center">
            <Button
              onClick={onViewAll}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
            >
              View {reviews.length - 3} more reviews
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
