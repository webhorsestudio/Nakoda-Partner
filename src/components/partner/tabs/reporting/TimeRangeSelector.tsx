import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TimeRangeSelectorProps } from './types';
import { timeRanges } from './sampleData';

export default function TimeRangeSelector({ selectedRange, onRangeChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {timeRanges.map((range) => (
        <Badge
          key={range.value}
          variant={selectedRange === range.value ? "default" : "outline"}
          className={`cursor-pointer transition-colors ${
            selectedRange === range.value
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'hover:bg-blue-50'
          }`}
          onClick={() => onRangeChange(range.value)}
        >
          {range.label}
        </Badge>
      ))}
    </div>
  );
}
