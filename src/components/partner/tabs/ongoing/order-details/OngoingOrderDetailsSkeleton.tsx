import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function OngoingOrderDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Order Details Header Skeleton */}
        <Card className="w-full">
          <CardHeader>
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <div className="h-px bg-slate-200" />
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info Section Skeleton */}
        <Card className="w-full">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Skeleton className="w-4 h-4 rounded-full mt-1" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Location Map Skeleton */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-5 w-64 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="w-full h-64 rounded-lg" />
              <div className="flex justify-center">
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Details Section Skeleton */}
        <Card className="w-full">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-4 w-48 mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Footer Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="max-w-4xl mx-auto">
          <div className="p-4">
            <div className="flex items-center justify-center">
              <Skeleton className="h-12 w-64 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
