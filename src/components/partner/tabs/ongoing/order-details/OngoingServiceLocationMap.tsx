import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPinIcon } from 'lucide-react';

interface OngoingServiceLocationMapProps {
  location: string;
  customerAddress: string;
  city: string;
  pinCode: string;
}

export default function OngoingServiceLocationMap({ 
  location, 
  customerAddress, 
  city, 
  pinCode 
}: OngoingServiceLocationMapProps) {
  // Create a search query for Google Maps
  const searchQuery = encodeURIComponent(`${customerAddress}, ${city}, ${pinCode}`);
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${searchQuery}`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MapPinIcon className="w-5 h-5" />
          Service Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Location Details */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Service Address</div>
            <div className="font-medium text-gray-900">{customerAddress}</div>
            <div className="text-sm text-gray-600">{city} - {pinCode}</div>
          </div>

          {/* Google Map */}
          <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
              <iframe
                src={googleMapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Service Location Map"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <MapPinIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Google Maps API key not configured</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Please configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Directions Button */}
          <div className="flex justify-center">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${searchQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <MapPinIcon className="w-4 h-4" />
              Get Directions
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
