import React from 'react';
import { WrenchIcon, ClockIcon, CalendarIcon, AlertCircleIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceDetailsSectionProps } from './types';

export default function ServiceDetailsSection({ service }: ServiceDetailsSectionProps) {
  return (
    <Card className="bg-white border border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
          <WrenchIcon className="w-5 h-5 text-green-600" />
          Service Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Category</label>
              <div className="text-slate-900">{service.category}</div>
            </div>
            
            {service.subcategory && (
              <div>
                <label className="text-sm font-medium text-slate-700">Subcategory</label>
                <div className="text-slate-900">{service.subcategory}</div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-slate-700">Estimated Duration</label>
              <div className="text-slate-900 flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                {service.estimatedDuration}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Service Date</label>
              <div className="text-slate-900 flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {service.serviceDate}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700">Service Time</label>
              <div className="text-slate-900 flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                {service.serviceTime}
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Service Instructions</label>
            <div className="text-slate-900 bg-slate-50 p-3 rounded-md">
              {service.instructions}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700">Requirements</label>
            <div className="text-slate-900 bg-slate-50 p-3 rounded-md">
              {service.requirements}
            </div>
          </div>
          
          {service.specialRequirements && (
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <AlertCircleIcon className="w-4 h-4 text-orange-500" />
                Special Requirements
              </label>
              <div className="text-slate-900 bg-orange-50 p-3 rounded-md border border-orange-200">
                {service.specialRequirements}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
