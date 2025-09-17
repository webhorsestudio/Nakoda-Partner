import React from 'react';
import { UserIcon, PhoneIcon, MailIcon, MapPinIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OngoingCustomerInfoSectionProps } from './types';

export default function OngoingCustomerInfoSection({ customer }: OngoingCustomerInfoSectionProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <UserIcon className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="font-medium">{customer.name}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPinIcon className="w-4 h-4 text-gray-500 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Address</div>
              <div className="font-medium">{customer.address}</div>
              <div className="text-sm text-gray-600">{customer.city} - {customer.pinCode}</div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Button 
              size="sm" 
              variant="outline" 
              asChild
              style={{ backgroundColor: '#FF8000', borderColor: '#FF8000', color: 'white' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E67300';
                e.currentTarget.style.borderColor = '#E67300';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF8000';
                e.currentTarget.style.borderColor = '#FF8000';
              }}
            >
              <a href={`tel:${customer.phone}`}>
                <PhoneIcon className="w-3 h-3 mr-1" />
                Call Now
              </a>
            </Button>
          </div>

          {customer.email && (
            <div className="flex items-center gap-3">
              <MailIcon className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <div className="text-sm text-gray-500">Email</div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{customer.email}</span>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`mailto:${customer.email}`}>
                      <MailIcon className="w-3 h-3 mr-1" />
                      Email
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
