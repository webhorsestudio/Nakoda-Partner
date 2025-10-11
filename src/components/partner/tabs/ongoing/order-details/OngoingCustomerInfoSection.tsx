import React from 'react';
import { UserIcon, PhoneIcon, MailIcon, MapPinIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OngoingCustomerInfoSectionProps } from './types';
import { ACEFONE_CONFIG } from '@/config/acefone';

export default function OngoingCustomerInfoSection({ customer, taskId }: OngoingCustomerInfoSectionProps) {
  const handleCallNow = async () => {
    if (!customer.phone) {
      return;
    }
    
    // Format customer phone to 10 digits (remove country code for India)
    let formattedCustomerPhone = customer.phone;
    if (customer.phone.startsWith('+91') && customer.phone.length === 13) {
      // +917506873720 -> 7506873720
      formattedCustomerPhone = customer.phone.substring(3);
    } else if (customer.phone.startsWith('91') && customer.phone.length === 12) {
      // 917506873720 -> 7506873720
      formattedCustomerPhone = customer.phone.substring(2);
    } else if (customer.phone.length > 10) {
      // Take last 10 digits for any other long numbers
      formattedCustomerPhone = customer.phone.slice(-10);
    }
    
    // Log the call initiation attempt
    console.log('📞 Masked Call initiated:', {
      taskId,
      customerPhone: formattedCustomerPhone,
      originalCustomerPhone: customer.phone,
      didNumber: ACEFONE_CONFIG.DID_NUMBER,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Call our Masked Call API endpoint
      const response = await fetch('/api/acefone-masked-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          taskId,
          customerPhone: formattedCustomerPhone
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Copy DID number to clipboard
        try {
          await navigator.clipboard.writeText(ACEFONE_CONFIG.DID_NUMBER);
        } catch {
          // Silent fallback if clipboard fails
        }

        // Automatically open the phone dialer with the DID number
        try {
          // Create tel: link to open the dialer
          const telLink = `tel:${ACEFONE_CONFIG.DID_NUMBER}`;
          
          // Try multiple methods to open the dialer
          if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
            // Mobile devices - use window.location.href
            window.location.href = telLink;
          } else {
            // Desktop/other devices - try window.open first, then fallback
            const dialerWindow = window.open(telLink, '_self');
            if (!dialerWindow) {
              // If popup blocked, try direct navigation
              window.location.href = telLink;
            }
          }
          
          console.log('📞 Dialer opened with DID number:', ACEFONE_CONFIG.DID_NUMBER);
          
        } catch (dialerError) {
          console.error('❌ Failed to open dialer:', dialerError);
        }
        
        console.log('✅ Masked Call successful:', {
          callId: result.callId,
          didNumber: result.didNumber,
          message: result.message,
          taskId,
          customerPhone: formattedCustomerPhone
        });
        
      } else {
        console.error('❌ Masked Call failed:', result);
      }
      
    } catch (error) {
      console.error('❌ Error setting up Masked Call:', error);
    }
  };
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
              onClick={handleCallNow}
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
              <PhoneIcon className="w-3 h-3 mr-1" />
              Call Now
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
