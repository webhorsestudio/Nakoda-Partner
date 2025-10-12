"use client";

import React from 'react';

interface OrderCardSkeletonProps {
  count?: number;
}

export const OrderCardSkeleton: React.FC<OrderCardSkeletonProps> = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          
          {/* Customer Info */}
          <div className="mb-4">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          
          {/* Service Info */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          
          {/* Location */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mt-1"></div>
          </div>
          
          {/* Amount */}
          <div className="mb-4">
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default OrderCardSkeleton;
