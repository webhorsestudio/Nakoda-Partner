import React from 'react';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MetricsCardProps } from './types';

export default function MetricsCard({ title, value, subtitle, icon, trend, color = 'blue' }: MetricsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'orange':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const getIconBgColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100';
      case 'purple':
        return 'bg-purple-100';
      case 'orange':
        return 'bg-orange-100';
      case 'red':
        return 'bg-red-100';
      default:
        return 'bg-blue-100';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${getIconBgColor(color)}`}>
                <div className={getColorClasses(color)}>
                  {icon}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">{title}</h3>
                {subtitle && (
                  <p className="text-xs text-slate-500">{subtitle}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-slate-900">
                {typeof value === 'number' && value >= 1000 
                  ? `₹${(value / 1000).toFixed(1)}k` 
                  : typeof value === 'number' 
                    ? `₹${value}` 
                    : value}
              </div>
              
              {trend && (
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.isPositive ? (
                    <TrendingUpIcon className="w-3 h-3" />
                  ) : (
                    <TrendingDownIcon className="w-3 h-3" />
                  )}
                  {trend.value}%
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
