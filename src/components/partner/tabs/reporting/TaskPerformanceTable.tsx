import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarIcon, TrendingUpIcon } from 'lucide-react';
import { TaskPerformanceTableProps } from './types';

export default function TaskPerformanceTable({ data, isLoading = false }: TaskPerformanceTableProps) {
  const getCompletionRate = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

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
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                  {data.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{item.serviceType}</div>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {item.totalTasks}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {item.completedTasks}
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
                            {item.averageRating}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium text-slate-900">
                          ₹{item.totalEarnings.toLocaleString()}
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
                    {data.reduce((sum, item) => sum + item.totalTasks, 0)}
                  </div>
                  <div className="text-xs text-slate-500">Total Tasks</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    {data.reduce((sum, item) => sum + item.completedTasks, 0)}
                  </div>
                  <div className="text-xs text-slate-500">Completed</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    {data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.averageRating, 0) / data.length * 10) / 10 : 0}
                  </div>
                  <div className="text-xs text-slate-500">Avg Rating</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    ₹{data.reduce((sum, item) => sum + item.totalEarnings, 0).toLocaleString()}
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
