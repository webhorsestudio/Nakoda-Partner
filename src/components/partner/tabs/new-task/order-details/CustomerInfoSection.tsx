import React from 'react';
import { UserIcon, PhoneIcon, MailIcon, MapPinIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerInfoSectionProps } from './types';

export default function CustomerInfoSection({ customer }: CustomerInfoSectionProps) {
  return (
    <Card className="bg-white border border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-blue-600" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-900">{customer.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700">{customer.phone}</span>
            </div>
            
            {customer.email && (
              <div className="flex items-center gap-2">
                <MailIcon className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700">{customer.email}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPinIcon className="w-4 h-4 text-slate-500 mt-0.5" />
              <div className="text-slate-700">
                <div>{customer.address}</div>
                <div className="text-sm text-slate-600">
                  {customer.city} - {customer.pinCode}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
