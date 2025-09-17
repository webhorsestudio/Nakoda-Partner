import React from 'react';
import { MapPinIcon } from 'lucide-react';

interface OngoingLocationInfoProps {
  location: string;
  customerAddress?: string;
}

export default function OngoingLocationInfo({ location, customerAddress }: OngoingLocationInfoProps) {
  return (
    <div className="flex items-center gap-3">
      <MapPinIcon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground truncate">{location}</span>
    </div>
  );
}
