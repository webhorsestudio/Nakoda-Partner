import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarIcon, TrendingUpIcon } from 'lucide-react';
import { TaskPerformanceTableProps } from './types';
import { getCleanServiceTitle } from '../ongoing/utils/titleUtils';

export default function TaskPerformanceTable({ data, isLoading = false }: TaskPerformanceTableProps) {
  const getCompletionRate = (completed: number, total: number) => {
    const completedNum = Number(completed) || 0;
    const totalNum = Number(total) || 0;
    if (totalNum === 0) return 0;
    const rate = (completedNum / totalNum) * 100;
    return isNaN(rate) ? 0 : Math.round(rate);
  };

  // Ensure data is always an array and filter out invalid items
  const validData = Array.isArray(data) ? data.filter(item => 
    item && 
    typeof item === 'object' && 
    item.serviceType
  ) : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Performance by Service Type
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUpIcon className="w-4 h-4" />
            <span>Overall improvement</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {/* Table Header Skeleton */}
            <div className="grid grid-cols-6 gap-4 pb-3 border-b border-slate-200">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-full h-4 bg-slate-200 rounded animate-pulse"></div>
              ))}
            </div>
            {/* Table Rows Skeleton */}
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="grid grid-cols-6 gap-4 py-3">
                {[1, 2, 3, 4, 5, 6].map((col) => (
                  <div key={col} className="w-full h-4 bg-slate-200 rounded animate-pulse"></div>
                ))}
              </div>
            ))}
            {/* Summary Skeleton */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="w-16 h-6 bg-slate-200 rounded animate-pulse mx-auto mb-1"></div>
                    <div className="w-20 h-3 bg-slate-200 rounded animate-pulse mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Service Type</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-700">Total Tasks</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-700">Completed</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-700">Completion Rate</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-700">Avg Rating</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">Total Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {validData.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{getCleanServiceTitle(item.serviceType)}</div>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {Number(item.totalTasks) || 0}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {Number(item.completedTasks) || 0}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="text-sm font-medium text-slate-900">
                            {getCompletionRate(item.completedTasks, item.totalTasks)}%
                          </div>
                          <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${getCompletionRate(item.completedTasks, item.totalTasks)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-slate-900">
                            {Number(item.averageRating) || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium text-slate-900">
                          ₹{(Number(item.totalEarnings) || 0).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    {validData.reduce((sum, item) => sum + (Number(item.totalTasks) || 0), 0)}
                  </div>
                  <div className="text-xs text-slate-500">Total Tasks</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    {validData.reduce((sum, item) => sum + (Number(item.completedTasks) || 0), 0)}
                  </div>
                  <div className="text-xs text-slate-500">Completed</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    {(() => {
                      const validRatings = validData.filter(item => 
                        item.averageRating != null && 
                        !isNaN(Number(item.averageRating)) && 
                        Number(item.averageRating) > 0
                      );
                      if (validRatings.length === 0) return '0';
                      const avgRating = validRatings.reduce((sum, item) => sum + Number(item.averageRating), 0) / validRatings.length;
                      return isNaN(avgRating) ? '0' : Math.round(avgRating * 10) / 10;
                    })()}
                  </div>
                  <div className="text-xs text-slate-500">Avg Rating</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    ₹{validData.reduce((sum, item) => sum + (Number(item.totalEarnings) || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">Total Earnings</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
