import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUpIcon } from 'lucide-react';
import { EarningsChartProps } from './types';

export default function EarningsChart({ data, timeRange, isLoading = false }: EarningsChartProps) {
  const maxEarnings = data.length > 0 ? Math.max(...data.map(d => d.earnings)) : 0;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '3m': return 'Last 3 Months';
      case '6m': return 'Last 6 Months';
      case '1y': return 'Last Year';
      default: return 'Earnings';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            {getTimeRangeLabel(timeRange)}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUpIcon className="w-4 h-4" />
            <span>+12% from last period</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart Bars */}
          <div className="relative">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {data.length > 14 && (
                  <div className="absolute top-2 right-2 z-10 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    Scroll to view all
                  </div>
                )}
                <div className="overflow-x-auto">
              <div 
                className="flex items-end h-48 gap-1"
                style={{ 
                  minWidth: data.length > 14 ? `${data.length * 40}px` : '100%',
                  justifyContent: data.length <= 14 ? 'space-between' : 'flex-start'
                }}
              >
              {data.map((item, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center"
                  style={{ 
                    minWidth: data.length > 14 ? '36px' : 'auto',
                    flex: data.length <= 14 ? '1' : 'none'
                  }}
                >
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                    style={{ 
                      height: `${(item.earnings / maxEarnings) * 100}%`,
                      minHeight: '20px',
                      width: data.length > 14 ? '24px' : '100%'
                    }}
                  />
                  <div className="text-xs text-slate-500 mt-2 text-center whitespace-nowrap">
                    {formatDate(item.date)}
                  </div>
                  <div className="text-xs font-medium text-slate-700 mt-1 text-center">
                    ₹{item.earnings}
                  </div>
                </div>
              ))}
              </div>
            </div>
              </>
            )}
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">
                ₹{data.reduce((sum, item) => sum + item.earnings, 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">Total Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">
                {data.reduce((sum, item) => sum + item.tasks, 0)}
              </div>
              <div className="text-xs text-slate-500">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">
                ₹{Math.round(data.reduce((sum, item) => sum + item.earnings, 0) / data.length).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">Daily Average</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
